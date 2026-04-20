# Textory sendSMS — Open API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Base URL](https://img.shields.io/badge/Base%20URL-openapi.textory.io-blue)](https://openapi.textory.io)
[![Global](https://img.shields.io/badge/Coverage-Global-brightgreen)](#supported-channels)

> Send SMS / LMS / MMS / KakaoTalk AlimTalk via a single HTTP API — from **anywhere in the world**.
> Hosted and operated by [Textory](https://textory.io).

**🌏 Global developers — start with `/messages/phone`.** The Phone channel works in every country
because it sends through the Textory Android app paired to your account, using the device's
own carrier connection. No region restriction, no pre-registered sender number required.

- **Base URL**: `https://openapi.textory.io`
- **Auth**: `Authorization: Bearer sk_live_xxxxxxxxxxxx`
- **Versioning**: URL prefix `/openapi/v1`
- **Spec**: [`openapi.yaml`](./openapi.yaml) (OpenAPI 3.0 — import into Postman, Stoplight, Insomnia)

## Quick Start (60 seconds)

### 1) Get an API key

1. Sign in to [https://www.textory.io](https://www.textory.io)
2. Visit **Settings → API Keys** (`/setting-api-keys`)
3. Click **New API Key**, choose permissions (`phone_send`, `web_send`), and copy the generated key. It starts with `sk_live_`.
4. Store it in an environment variable (`TEXTORY_API_KEY`). Never hard-code keys in source.

### 2) Send your first SMS (curl)

```bash
curl -X POST https://openapi.textory.io/openapi/v1/messages/phone \
  -H "Authorization: Bearer $TEXTORY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [
      { "phoneNumber": "+821012345678" }
    ],
    "contents": "Hello from Textory!"
  }'
```

Response:

```json
{
  "success": true,
  "data": {
    "messageId": "65a9f1b2c3d4e5f67890abcd",
    "status": "queued",
    "acceptedCount": 1,
    "rejectedCount": 0
  }
}
```

## Supported Channels

| Channel | Endpoint | Coverage | Requires | Billing |
|---|---|---|---|---|
| **Phone SMS** | `POST /openapi/v1/messages/phone` | Global (via paired phone app) | Paired Textory Android app online | Phone plan |
| **Web SMS/LMS/MMS** | `POST /openapi/v1/messages/web` | 🇰🇷 Korea only | Pre-registered sender number | **Credits deducted** per message |
| **KakaoTalk AlimTalk** | `POST /openapi/v1/messages/kakao` | 🇰🇷 Korea only | Template approval + senderKey | **Credits deducted** |

See channel-specific docs:

- [Phone send](./docs/phone-send.md)
- [Web send](./docs/web-send.md) *(KR only)*
- [KakaoTalk AlimTalk](./docs/kakao-send.md) *(KR only, Phase 2)*

## Core Documentation

- [Authentication](./docs/authentication.md)
- [Error Codes](./docs/errors.md)
- [Rate Limits & Quotas](./docs/rate-limits.md)

## Code Samples

Ready-to-run examples in 7 languages:

- [cURL](./examples/curl)
- [Node.js (axios + TypeScript types)](./examples/nodejs)
- [Python (requests)](./examples/python)
- [Java (OkHttp)](./examples/java)
- [PHP (cURL)](./examples/php)
- [Go (net/http)](./examples/go)
- [Ruby (Net::HTTP)](./examples/ruby)

Each folder has a self-contained `README.md` with install + run instructions.

## Postman / Insomnia

Import [`postman/textory-sendsms.postman_collection.json`](./postman/textory-sendsms.postman_collection.json) or the [OpenAPI spec](./openapi.yaml) directly.

## Common Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/openapi/v1/messages/phone` | Send via paired phone (any region) |
| `POST` | `/openapi/v1/messages/web` | Send via web gateway (KR only) |
| `POST` | `/openapi/v1/messages/kakao` | Send KakaoTalk AlimTalk (KR only) |
| `GET`  | `/openapi/v1/messages/{id}` | Get message status |
| `GET`  | `/openapi/v1/senders` | List registered sender numbers |
| `GET`  | `/openapi/v1/account/balance` | Current credit balance |

## Response Envelope

All responses use a consistent envelope so clients can branch on one field:

```jsonc
// Success
{ "success": true, "data": { /* resource */ } }

// Error
{ "success": false, "error": { "code": "invalid_sender", "message": "...", "details": { } } }
```

See [error codes](./docs/errors.md).

## Rate Limits

Per-API-key limits are configurable when you create a key (daily / monthly / per-minute). When throttled, responses return `429 Too Many Requests` with retry headers. See [rate-limits.md](./docs/rate-limits.md).

## Security Recommendations

- Always use **HTTPS**. HTTP requests are rejected.
- Store keys in environment variables or a secrets manager (Vault, AWS Secrets Manager, Doppler).
- Scope keys to the minimum permissions (e.g. `phone_send` only).
- Add an **IP whitelist** when provisioning a key for server-only usage.
- Rotate keys periodically via the dashboard.
- Revoke compromised keys immediately from Settings → API Keys.

## Support

- **Issues / Bug reports**: open a GitHub issue in this repository.
- **Email**: support@textory.io
- **Status page**: [https://status.textory.io](https://status.textory.io)

## License

[MIT](./LICENSE) — example code and docs in this repository are free to copy, modify, and redistribute. The Textory Open API service itself is operated under separate [Terms of Service](https://textory.io/terms).
