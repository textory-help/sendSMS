# Rate Limits & Quotas

Every API key has its own quota, configured when the key is created and adjustable
at [https://www.textory.io/setting-api-keys](https://www.textory.io/setting-api-keys).

## Quota types

| Type | Description |
|---|---|
| `per_minute` | Rolling 60-second window. Default 60 req/min. |
| `daily` | Messages sent per UTC day. Default 10,000. |
| `monthly` | Messages sent per billing month. Default 300,000. |

Send endpoints count the **request**, not individual recipients — a single request with
1000 recipients counts as one toward `per_minute` but 1000 toward `daily`/`monthly`.

## Throttling response

When you exceed a limit:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 8
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded for 'per_minute'",
    "details": { "limit": "per_minute", "retryAfterSeconds": 8 }
  }
}
```

- Always respect `Retry-After`.
- Use exponential backoff with jitter for non-429 transient errors.

## Client-side best practices

### 1. Batch recipients

A single request accepts up to 1000 recipients. Batching into larger requests is much more
efficient than sending one call per recipient.

### 2. Use idempotency keys

Always include a `clientId` (UUID). Retries with the same `clientId` are deduplicated
server-side, so aggressive retry loops are safe.

### 3. Back off on 429

```js
async function withRetry(fn, attempt = 0) {
  try {
    return await fn();
  } catch (err) {
    if (err.response && err.response.status === 429 && attempt < 5) {
      const retryAfter = parseInt(err.response.headers['retry-after'] || '1', 10);
      const jitter = Math.random() * 500;
      await new Promise(r => setTimeout(r, retryAfter * 1000 + jitter));
      return withRetry(fn, attempt + 1);
    }
    throw err;
  }
}
```

### 4. Monitor usage

```bash
curl https://openapi.textory.io/openapi/v1/account/balance \
  -H "Authorization: Bearer $TEXTORY_API_KEY"
```

Returns your current month's sent counts by channel.

## Requesting a higher quota

If your default quotas aren't enough, open an issue in the GitHub repository or email
help@textory.io with:

- Your account email or `keyId` prefix (do **not** share the full API key).
- Expected peak req/min and daily volume.
- Use case description.

Production enterprise quotas typically approve within 2 business days.
