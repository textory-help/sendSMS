# 웹 발송 — `POST /openapi/v1/messages/web`

**🇰🇷 한국 전용 채널입니다.** 해외 발송은 [`/messages/phone`](./phone-send.md) 을 사용하세요.

Textory 의 국내 웹 게이트웨이를 통해 SMS / LMS / MMS 를 발송합니다. 발송 건당 크레딧이 계정 잔액에서 차감됩니다.

| 항목 | 값 |
|---|---|
| 커버리지 | 한국 (`+82`) 전용 |
| 필수 권한 | `web_send` |
| 크레딧 차감 | **예** (SMS / LMS / MMS 각각 요금 상이) |
| 발신번호 등록 | **필수** — 아래 참조 |
| 페어링된 폰 필요 | **불필요** |

## 발신번호 등록 (최초 1회)

국내 통신사 정책상 모든 발신번호는 사전 등록·인증이 필수입니다:

1. [https://www.textory.io](https://www.textory.io) → **환경설정 → 발신번호 관리**
2. 사용할 발신번호 추가
3. 필수 증빙 제출
   - 법인 번호: 사업자등록증
   - 개인 번호: 신분증 + 통신요금고지서
4. 통신사 승인 대기 (영업일 기준 1–3일)
5. 승인된 발신번호 목록은 언제든 `GET /openapi/v1/senders` 로 조회

미등록 번호로 발송 시 `400` + `"code": "sender_not_registered"` 반환.

## 요청

```
POST /openapi/v1/messages/web
Authorization: Bearer sk_live_xxx
Content-Type: application/json
```

| 필드 | 타입 | 필수 | 비고 |
|---|---|---|---|
| `sender` | string | ✅ | 등록·승인된 발신번호. E.164 또는 `010xxxxxxxx` |
| `recipients[]` | array | ✅ | 1–50명 (초과 시 여러 번 호출로 분할). `+82` 또는 국내 형식만 허용 |
| `contents` | string | ✅ | UTF-8 |
| `title` | string | 조건부 | LMS/MMS 에 필수 |
| `contentsType` | enum | ❌ | `sms`, `lms`, `mms`. 미지정 시 자동 판별 |
| `attachments[]` | array | ❌ | MMS 이미지 (HTTPS URL, 최대 3개, 각 300KB) |
| `reservedAt` | ISO 8601 | ❌ | 예약 발송 |
| `clientId` | string | 권장 | 멱등 키 |

## 예제

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

## 메시지 타입 자동 판별

| 컨텐츠 특성 | 판별 타입 |
|---|---|
| 90 bytes 이하, `title` 없음, `attachments` 없음 | `sms` |
| 90 bytes 초과 또는 `title` 존재 | `lms` |
| `attachments` 존재 | `mms` |

건당 요금(KRW)은 대시보드에서 확인 가능합니다. 특정 과금 타입으로 강제 발송이 필요하면 `contentsType` 을 명시하세요.

## 크레딧 차감 흐름

1. 발송 전 API 가 총 비용 계산: `rate[type] × recipients.length`
2. 잔액 부족 시 `402 Payment Required` + `"code": "insufficient_balance"` 반환. **발송 되지 않고 차감도 되지 않음**
3. 성공 시 원자적(atomic)으로 차감. 개별 수신자 실패는 자동 환불되지 **않음**. 통신사 장애로 인한 환불 요청은 고객 지원으로 연락

잔액은 프로그램으로 확인 가능:

```bash
curl https://openapi.textory.io/openapi/v1/account/balance \
  -H "Authorization: Bearer $TEXTORY_API_KEY"
```

## 광고성 메시지

정보통신망법에 따라 광고성 발송에는 메시지 앞에 `(광고)` 표시와 수신거부 연락처가 포함되어야 합니다. Textory 가 자동 삽입하지 **않습니다**. 준법 의무는 발송 주체에게 있습니다.

## 제한 사항

- **국가**: 한국 전용. `+82` 가 아닌 번호는 거부됨
- **요청당 수신자**: 50명. 대량 발송은 여러 번 호출로 분할 — API 서버 순간 부하 방지용 상한
- **LMS 본문**: 2000 bytes
- **MMS 이미지**: 3장 × 300KB, JPG/PNG
- **Rate limit**: 키별 대시보드에서 설정 가능
