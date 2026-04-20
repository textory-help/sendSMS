# Phone Send — `POST /openapi/v1/messages/phone`

**🌏 The recommended channel for international developers.**

The Phone channel forwards messages through the Textory Android app paired to your account.
The app sends them using the phone's own carrier connection — so delivery works in every
country and with any local carrier.

| Property | Value |
|---|---|
| Coverage | 🌏 Global (any country your phone's carrier supports) |
| Required permission | `phone_send` |
| Credits deducted | **No** — you pay your normal phone plan's SMS/MMS charges |
| Requires sender registration | **No** |
| Requires paired phone | **Yes** — the Android app must be installed, signed in, and online |

## Setup (5 minutes)

1. Install **Textory** on an Android phone:
   - Google Play: [TEXTORY](https://play.google.com/store/apps/details?id=io.android.textory)
2. Sign in with the account that owns your API key.
3. Grant SMS + contacts permissions.
4. Keep the app running in the background. It will reconnect automatically after reboot.

The phone's SIM card is the one that actually sends the message; Textory just queues it.

## Request

```
POST /openapi/v1/messages/phone
Authorization: Bearer sk_live_xxx
Content-Type: application/json
```

| Field | Type | Required | Notes |
|---|---|---|---|
| `recipients[]` | array | ✅ | 1–1000 entries |
| `recipients[].phoneNumber` | string | ✅ | E.164 (`+821012345678`) preferred; local format accepted |
| `recipients[].name` | string | ❌ | Used for `{{name}}` template variable |
| `recipients[].variables` | object | ❌ | Per-recipient `{{key}}` values |
| `contents` | string | ✅ | UTF-8, up to 2000 chars |
| `title` | string | ❌ | For LMS/MMS (>80 bytes) |
| `contentsType` | enum | ❌ | `sms`, `lms`, `mms` — omit for auto |
| `attachments[]` | array | ❌ | MMS image URLs (max 3, HTTPS, public) |
| `reservedAt` | ISO 8601 | ❌ | Schedule delivery; max 90 days ahead |
| `clientId` | string | recommended | Idempotency key (UUID recommended) |

## Minimal example

```bash
curl -X POST https://openapi.textory.io/openapi/v1/messages/phone \
  -H "Authorization: Bearer $TEXTORY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [{ "phoneNumber": "+14155551234" }],
    "contents": "Your verification code is 917043."
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

## Per-recipient personalization

```json
{
  "recipients": [
    { "phoneNumber": "+441234567890", "name": "Alice", "variables": { "orderNo": "A-1234" } },
    { "phoneNumber": "+14155551234",   "name": "Bob",   "variables": { "orderNo": "B-5678" } }
  ],
  "contents": "Hi {{name}}, your order {{orderNo}} has shipped."
}
```

## Idempotency

If your network blips and you retry the same request, send the **same `clientId`**. The server
recognizes it and returns the original result instead of duplicating the message.

```js
import { v4 as uuidv4 } from 'uuid';
const clientId = uuidv4();

async function send() {
  // retry up to 3 times with the SAME clientId
  for (let i = 0; i < 3; i++) {
    try {
      return await api.post('/openapi/v1/messages/phone', { clientId, recipients, contents });
    } catch (err) {
      if (err.response && err.response.status >= 500) continue; // network/5xx → retry
      throw err;                                                 // 4xx → caller's fault
    }
  }
}
```

## Delivery model

1. `queued` — accepted, waiting for a paired phone to pull.
2. `sending` — the phone picked it up and is dispatching to the carrier.
3. `sent` — carrier accepted.
4. `delivered` — carrier confirmed handset receipt (if your carrier provides DLR).
5. `failed` — terminal failure; see `errorMessage` per recipient.

Poll `GET /openapi/v1/messages/{messageId}` for status.

## Limits

- **Message size:** 90 bytes (SMS) → auto-upgrade to LMS (2000 bytes) → MMS with attachments.
- **Recipients per request:** 1000.
- **Rate:** depends on your paired phone's carrier and your API key's quota.
- **Region:** bound by your phone's carrier roaming policy. US→KR works; KR→International works
  as long as your carrier permits.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `503 phone_offline` | Paired phone has no network | Ensure the phone is online. Check app background-restriction settings. |
| Status stuck on `queued` | App killed by battery optimizer | Disable battery optimization for Textory. |
| Wrong country code | Phone number wasn't E.164 | Always send `+<country><subscriber>`. |
| Duplicate messages | Retried without `clientId` | Use `clientId` for all retries. |

## Why phone send is ideal for global apps

- No carrier contracts or country-specific registration.
- Works in markets where web SMS gateways are expensive or blocked.
- Consumer devices avoid anti-spam heuristics that hit bulk gateways.
- Same per-message cost as your phone plan.

Use it for:

- Global 2FA / OTP delivery where you can't maintain 100+ country contracts.
- Customer support reply-backs.
- Verified business messaging from a real mobile number (better reply rates than shortcodes).
