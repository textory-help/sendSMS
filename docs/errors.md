# Error Codes

All errors follow this envelope:

```json
{
  "success": false,
  "error": {
    "code": "invalid_sender",
    "message": "Sender number is not registered or not approved",
    "details": { "sender": "+821012345678" }
  }
}
```

The HTTP status code and the `error.code` string together identify the error.

## 400 Bad Request — client errors

| `code` | Meaning | Remedy |
|---|---|---|
| `invalid_request` | Body failed validation. Check `details.field`. | Fix the offending field. |
| `missing_recipients` | `recipients` empty or missing. | Provide ≥ 1 recipient. |
| `missing_contents` | `contents` empty or missing. | Provide non-empty `contents`. |
| `invalid_phone_number` | E.164 format required. | Use `+<country><subscriber>`. |
| `unsupported_country` | Web/Kakao sent to non-KR number. | Use `/messages/phone` for non-KR. |
| `sender_not_registered` | Web/Kakao sender not approved. | Register at dashboard; wait for carrier approval. |
| `contents_too_long` | Body exceeds 2000 bytes (LMS max). | Split messages or use MMS. |
| `attachment_too_large` | MMS image > 300 KB or invalid format. | Compress or convert to JPG/PNG. |
| `invalid_reserved_at` | Past time or > 90 days ahead. | Use future ISO 8601 within 90 days. |
| `invalid_template` | Kakao `templateCode` not approved. | Check Kakao Business Center. |
| `variables_mismatch` | Kakao template variables don't match the approved template. | Align body to approved template. |

## 401 Unauthorized

| `code` | Meaning | Remedy |
|---|---|---|
| `unauthorized` | Missing `Authorization` header. | Send `Authorization: Bearer sk_live_...`. |
| `invalid_api_key` | Key not recognized. | Re-issue a key at the dashboard. |

## 402 Payment Required

| `code` | Meaning | Remedy |
|---|---|---|
| `insufficient_balance` | Not enough credits for web/kakao send. | Top up at the dashboard. |

## 403 Forbidden

| `code` | Meaning | Remedy |
|---|---|---|
| `api_key_inactive` | Key was revoked or disabled. | Create a new key. |
| `permission_denied` | Key lacks the required permission. | Re-issue with correct permissions. |
| `ip_not_allowed` | Request IP not in whitelist. | Add your IP on the dashboard or send from an allowed IP. |

## 404 Not Found

| `code` | Meaning | Remedy |
|---|---|---|
| `message_not_found` | `messageId` doesn't exist or belongs to another account. | Verify the ID returned from the send endpoint. |

## 409 Conflict — idempotency replay

`409` is **not an error** — it means your `clientId` matched a previously accepted request,
and the server returned the original message. Treat this as success.

## 429 Too Many Requests

Response headers include `Retry-After: <seconds>`. Implement exponential backoff.

## 500 / 502 / 503 Server errors

Transient server issues. Safe to retry `GET` requests immediately. For `POST`, retry with the
**same `clientId`** to avoid duplicates.

## 503 phone_offline

Phone channel only. The paired Android app is not reachable. Either:

- Wait — the app will reconnect automatically when network returns.
- Ask the phone owner to foreground the app or check battery optimization settings.
