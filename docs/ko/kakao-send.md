# 카카오 알림톡 — `POST /openapi/v1/messages/kakao`

**🇰🇷 한국 전용. Phase 2 — Open API 에서는 아직 정식 공개 전입니다.**

카카오 알림톡은 카카오톡 앱 내에서 발송되는 브랜디드 메시지 채널입니다. SMS 보다 저렴하고 국내 수신자에게 신뢰도가 높지만, 카카오의 템플릿 심사로 인해 온보딩에 1–2주가 소요됩니다.

## 사전 요구사항

1. **카카오 비즈니스 채널** — [카카오 비즈니스 센터](https://business.kakao.com)에 등록된 사업자 채널
2. **SenderKey (`senderKey`)** — 카카오가 채널별로 발급하는 키 (채널당 1개)
3. **승인된 템플릿** — `{{변수}}` placeholder 를 포함해 사전 작성 후 카카오 승인 (영업일 기준 1–3일)
4. Textory API 키에 **`kakao_send` 권한**
5. Textory 계정에 **충분한 크레딧** (알림톡은 SMS 보다 저렴하지만 여전히 건당 차감)

온보딩: [https://www.textory.io](https://www.textory.io) → **환경설정 → 카카오 채널**

## 요청 (Phase 2 프리뷰)

```
POST /openapi/v1/messages/kakao
Authorization: Bearer sk_live_xxx
Content-Type: application/json
```

| 필드 | 필수 | 비고 |
|---|---|---|
| `senderKey` | ✅ | 카카오 비즈니스 센터 발급 |
| `templateCode` | ✅ | 승인된 템플릿 식별자 |
| `recipients[]` | ✅ | 한국 번호만 |
| `recipients[].variables` | 조건부 | 템플릿에 `{{placeholder}}` 가 있으면 필수 |
| `contents` | ✅ | 승인된 템플릿 본문에 변수를 치환한 최종 문자열 |
| `fallbackType` | ❌ | `none` \| `sms` \| `lms` — 알림톡 실패 시 대체 발송 |
| `fallbackSender` | 조건부 | 등록된 발신번호. `fallbackType != none` 이면 필수 |
| `clientId` | 권장 | 멱등성 |

## 예제

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

## 템플릿 승인 팁

- 변수는 최소화 (`{{orderNo}}`, `{{name}}`). 변수 과다 템플릿은 반려됨
- 마케팅 성격은 별도 **친구톡(Friend Talk)** 카테고리로 분리. 알림톡은 정보성만 허용
- 승인된 템플릿은 수정 불가. 새로 만들어 기존 버전을 deprecate

## 링크

- [카카오 알림톡 공식 문서](https://kakaobusiness.gitbook.io/main/ad/bizmessage/notice-friend)
- [Textory 카카오 채널 설정](https://www.textory.io/setting-kakao)

*본 엔드포인트는 추후 정식 출시를 대비한 문서입니다. Early access 문의: help@textory.io*
