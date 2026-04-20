# KakaoTalk AlimTalk — `POST /openapi/v1/messages/kakao`

**🇰🇷 Korea only. Phase 2 — not yet fully available for Open API use.**

KakaoTalk AlimTalk is a branded-message channel inside the Kakao messenger app. Delivery is
cheaper than SMS and looks more trustworthy to Korean recipients, but onboarding takes
1–2 weeks due to Kakao's template review process.

## Prerequisites

1. **Kakao Business Channel** — a registered business on [Kakao Business Center](https://business.kakao.com).
2. **Sender Key (`senderKey`)** — issued by Kakao for your business channel. One per channel.
3. **Approved templates** — pre-written message templates with `{{variable}}` placeholders,
   reviewed and approved by Kakao (typically 1–3 business days).
4. **`kakao_send` permission** on your Textory API key.
5. **Sufficient credits** on your Textory account (Kakao AlimTalk is cheaper than SMS but
   still deducts credit).

Complete onboarding at [https://www.textory.io](https://www.textory.io) → **Settings → Kakao Channel**.

## Request (preview — coming in Phase 2)

```
POST /openapi/v1/messages/kakao
Authorization: Bearer sk_live_xxx
Content-Type: application/json
```

| Field | Required | Notes |
|---|---|---|
| `senderKey` | ✅ | From Kakao Business Center |
| `templateCode` | ✅ | Approved template identifier |
| `recipients[]` | ✅ | Korean numbers only |
| `recipients[].variables` | conditional | Required if the template has `{{placeholders}}` |
| `contents` | ✅ | Must match the approved template body with variables filled |
| `fallbackType` | ❌ | `none` \| `sms` \| `lms` — send SMS/LMS if AlimTalk fails |
| `fallbackSender` | conditional | Registered sender, required when `fallbackType != none` |
| `clientId` | recommended | Idempotency |

## Example

```bash
curl -X POST https://openapi.textory.io/openapi/v1/messages/kakao \
  -H "Authorization: Bearer $TEXTORY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "senderKey": "abc123...",
    "templateCode": "TPL_ORDER_SHIPPED",
    "recipients": [
      { "phoneNumber": "+821012345678", "variables": { "orderNo": "A-1234", "carrier": "CJ" } }
    ],
    "contents": "[Alice Shop]\n주문 A-1234 (CJ)이(가) 출고되었습니다.",
    "fallbackType": "sms",
    "fallbackSender": "+821098765432"
  }'
```

## Template approval tips

- Keep variables minimal (`{{orderNo}}`, `{{name}}`), Kakao rejects templates with too many.
- Marketing content must go through a separate **Friend Talk** category, not AlimTalk.
- Once approved, a template cannot be modified — create a new one and deprecate the old.

## Links

- [Kakao AlimTalk documentation (Korean)](https://kakaobusiness.gitbook.io/main/ad/bizmessage/notice-friend)
- [Textory Kakao channel setup](https://www.textory.io/setting-kakao)

*This endpoint is documented for upcoming release. Contact support@textory.io for early access.*
