# Web Send — `POST /openapi/v1/messages/web`

**🇰🇷 Korea only.** For global delivery, use [`/messages/phone`](./phone-send.md).

Delivers SMS / LMS / MMS through Textory's Korean web gateway. Per-message credits are deducted
from your account balance.

| Property | Value |
|---|---|
| Coverage | Korea (`+82`) only |
| Required permission | `web_send` |
| Credits deducted | **Yes** (SMS / LMS / MMS each have different rates) |
| Requires registered sender | **Yes** — see below |
| Paired phone required | **No** |

## Sender registration (one-time)

Korean carriers require every outbound sender number to be pre-approved:

1. Go to [https://www.textory.io](https://www.textory.io) → **Settings → Sender Numbers**.
2. Register the phone number you want to send from.
3. Upload the required documentation (business registration for corporate numbers,
   ID + carrier bill for personal numbers).
4. Wait 1–3 business days for carrier approval.
5. List approved senders anytime via `GET /openapi/v1/senders`.

You cannot send from an unregistered number; you will receive `400` with `"code": "sender_not_registered"`.

## Request

```
POST /openapi/v1/messages/web
Authorization: Bearer sk_live_xxx
Content-Type: application/json
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `sender` | string | ✅ | Registered sender number. E.164 or `010xxxxxxxx`. |
| `recipients[]` | array | ✅ | 1–1000 recipients. Only `+82` / Korean local numbers accepted. |
| `contents` | string | ✅ | UTF-8. |
| `title` | string | conditional | Required for LMS/MMS. |
| `contentsType` | enum | ❌ | `sms`, `lms`, `mms`. Auto-detected if omitted. |
| `attachments[]` | array | ❌ | MMS images (HTTPS URL, max 3, 300KB each). |
| `reservedAt` | ISO 8601 | ❌ | Schedule. |
| `clientId` | string | recommended | Idempotency key. |

## Example

```bash
curl -X POST https://openapi.textory.io/openapi/v1/messages/web \
  -H "Authorization: Bearer $TEXTORY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "+821098765432",
    "recipients": [
      { "phoneNumber": "+821012345678" },
      { "phoneNumber": "+821023456789" }
    ],
    "contents": "배송이 시작되었습니다. 감사합니다."
  }'
```

## Message type auto-detection

| Content characteristics | Detected type |
|---|---|
| ≤ 90 bytes, no `title`, no `attachments` | `sms` |
| > 90 bytes OR has `title` | `lms` |
| Has `attachments` | `mms` |

KRW rates are shown on the dashboard. You can force a type with `contentsType` if you need
a specific billing outcome.

## Credit deduction

1. Before sending, the API computes the total cost: `rate[type] × recipients.length`.
2. If your balance is too low, response is `402 Payment Required` with `"code": "insufficient_balance"`
   — nothing is sent, nothing is deducted.
3. On success, credits are deducted atomically. Individual recipient failures do **not** refund
   automatically; contact support for carrier outage refunds.

Check your balance programmatically:

```bash
curl https://openapi.textory.io/openapi/v1/account/balance \
  -H "Authorization: Bearer $TEXTORY_API_KEY"
```

## Advertising (광고) messages

Korean law requires outbound marketing messages to be prefixed with `(광고)` and to include
an opt-out number. Textory does not auto-insert these. You are responsible for compliance.

## Limits

- **Country:** Korea only. Non-`+82` recipients are rejected.
- **Recipients per request:** 1000.
- **LMS body:** 2000 bytes.
- **MMS images:** 3 × 300KB, JPG/PNG.
- **Rate limits:** configurable per API key on the dashboard.
