// Tiny reusable Textory Open API client for Node.js.
// Uses axios + idempotent retries. Zero dependencies besides axios + uuid.
//
// Usage:
//   import { TextoryClient } from './client.js';
//   const tx = new TextoryClient(process.env.TEXTORY_API_KEY);
//   await tx.sendPhone({ recipients: [{ phoneNumber: '+14155551234' }], contents: 'Hi' });

import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const DEFAULT_BASE_URL = 'https://openapi.textory.io';
const MAX_RETRIES = 3;

export class TextoryClient {
  /**
   * @param {string} apiKey - Starts with sk_live_.
   * @param {{ baseURL?: string, timeoutMs?: number }} [opts]
   */
  constructor(apiKey, opts = {}) {
    if (!apiKey) throw new Error('TEXTORY_API_KEY is required');
    this.http = axios.create({
      baseURL: opts.baseURL || DEFAULT_BASE_URL,
      timeout: opts.timeoutMs || 30_000,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /** Send via paired phone — works globally. */
  sendPhone(body) {
    return this._postWithRetry('/openapi/v1/messages/phone', this._withClientId(body));
  }

  /** Send via web gateway — Korea only, credits deducted. */
  sendWeb(body) {
    if (!body.sender) throw new Error('body.sender is required for web send');
    return this._postWithRetry('/openapi/v1/messages/web', this._withClientId(body));
  }

  /** Send Kakao AlimTalk — Korea only, Phase 2. */
  sendKakao(body) {
    if (!body.senderKey || !body.templateCode) {
      throw new Error('body.senderKey and body.templateCode are required for kakao send');
    }
    return this._postWithRetry('/openapi/v1/messages/kakao', this._withClientId(body));
  }

  getMessage(messageId) {
    return this._get(`/openapi/v1/messages/${encodeURIComponent(messageId)}`);
  }

  listSenders() {
    return this._get('/openapi/v1/senders');
  }

  getBalance() {
    return this._get('/openapi/v1/account/balance');
  }

  // ---- internals ----

  _withClientId(body) {
    // Attach a UUID v4 if the caller didn't — guarantees idempotent retries.
    return body.clientId ? body : { ...body, clientId: uuidv4() };
  }

  async _get(path) {
    const res = await this.http.get(path);
    return res.data;
  }

  async _postWithRetry(path, body) {
    let attempt = 0;
    let lastErr;
    while (attempt < MAX_RETRIES) {
      try {
        const res = await this.http.post(path, body);
        return res.data;
      } catch (err) {
        lastErr = err;
        const status = err.response && err.response.status;

        // 429: respect Retry-After header.
        if (status === 429) {
          const retryAfter = parseInt(
            (err.response.headers && err.response.headers['retry-after']) || '1', 10
          );
          await delay(retryAfter * 1000 + Math.random() * 500);
          attempt++;
          continue;
        }

        // 5xx: safe to retry because body carries the same clientId.
        if (status && status >= 500) {
          await delay(300 * Math.pow(2, attempt) + Math.random() * 300);
          attempt++;
          continue;
        }

        // 4xx: caller's fault. Don't retry.
        throw err;
      }
    }
    throw lastErr;
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
