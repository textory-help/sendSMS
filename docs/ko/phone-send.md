# 폰 발송 — `POST /openapi/v1/messages/phone`

**🌏 해외 개발자에게 권장하는 채널입니다.**

폰 채널은 사용자 계정에 페어링된 Textory Android 앱을 통해 메시지를 발송합니다.
앱이 단말의 통신사 회선으로 직접 발송하므로, **국가 제한 없이 전 세계 어디서든** 동작합니다.

| 항목 | 값 |
|---|---|
| 커버리지 | 🌏 전 세계 (페어링된 폰의 통신사가 지원하는 모든 국가) |
| 필수 권한 | `phone_send` |
| 크레딧 차감 | **없음** — 본인 휴대폰 요금제의 SMS/MMS 요금만 발생 |
| 발신번호 등록 | **불필요** |
| 페어링된 폰 필요 | **예** — Android 앱 설치·로그인·온라인 필요 |

## 준비 (5분)

1. Android 폰에 **Textory** 설치
   - Google Play: [TEXTORY](https://play.google.com/store/apps/details?id=io.android.textory)
2. API 키를 소유한 계정으로 로그인
3. SMS · 연락처 권한 허용
4. 앱이 백그라운드에 유지되도록 설정. 리부트 후에도 자동 재연결

메시지를 실제로 내보내는 주체는 폰의 SIM 카드입니다. Textory 는 전송 큐를 관리할 뿐입니다.

## 요청

```
POST /openapi/v1/messages/phone
Authorization: Bearer sk_live_xxx
Content-Type: application/json
```

| 필드 | 타입 | 필수 | 비고 |
|---|---|---|---|
| `recipients[]` | array | ✅ | 1–1000 개 |
| `recipients[].phoneNumber` | string | ✅ | E.164 (`+821012345678`) 권장, 국내 형식도 허용 |
| `recipients[].name` | string | ❌ | `{{name}}` 템플릿 변수용 |
| `recipients[].variables` | object | ❌ | 수신자별 `{{key}}` 값 |
| `contents` | string | ✅ | UTF-8, 최대 2000자 |
| `title` | string | ❌ | LMS/MMS (>80 bytes) 용 제목 |
| `contentsType` | enum | ❌ | `sms`, `lms`, `mms` — 미지정 시 자동 판별 |
| `attachments[]` | array | ❌ | MMS 이미지 URL (최대 3개, HTTPS, 공개) |
| `reservedAt` | ISO 8601 | ❌ | 예약 발송, 최대 90일 이후 |
| `clientId` | string | 권장 | 멱등 키 (UUID 권장) |

## 최소 예제

```bash
curl -X POST https://openapi.textory.io/openapi/v1/messages/phone \
  -H "Authorization: Bearer $TEXTORY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [{ "phoneNumber": "+821012345678" }],
    "contents": "인증번호는 917043입니다."
  }'
```

응답:

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

## 수신자별 개인화

```json
{
  "recipients": [
    { "phoneNumber": "+821012345678", "name": "지민", "variables": { "orderNo": "A-1234" } },
    { "phoneNumber": "+821098765432", "name": "수현", "variables": { "orderNo": "B-5678" } }
  ],
  "contents": "{{name}}님, 주문 {{orderNo}} 이(가) 출고되었습니다."
}
```

## 멱등성(Idempotency)

네트워크 끊김으로 동일 요청을 재시도할 때는 **동일한 `clientId`** 로 보내세요. 서버가 이를 인식해 기존 결과를 반환하며, 메시지가 중복 발송되지 않습니다.

```js
import { v4 as uuidv4 } from 'uuid';
const clientId = uuidv4();

async function send() {
  // 최대 3회까지 '동일한 clientId'로 재시도
  for (let i = 0; i < 3; i++) {
    try {
      return await api.post('/openapi/v1/messages/phone', { clientId, recipients, contents });
    } catch (err) {
      if (err.response && err.response.status >= 500) continue; // 네트워크/5xx → 재시도
      throw err;                                                 // 4xx → 호출자 문제
    }
  }
}
```

## 전송 상태 모델

1. `queued` — 접수 완료, 페어링된 폰의 pull 대기
2. `sending` — 폰이 pull 하여 통신사로 발송 중
3. `sent` — 통신사가 수신 확인
4. `delivered` — 통신사가 단말 수신까지 확인 (DLR 지원 시)
5. `failed` — 최종 실패, 수신자별 `errorMessage` 확인

`GET /openapi/v1/messages/{messageId}` 로 상태 폴링하세요.

## 제한 사항

- **메시지 크기**: 90 bytes(SMS) → 초과 시 LMS(2000 bytes) 로 자동 승격 → 첨부 시 MMS
- **요청당 수신자**: 1000명
- **속도**: 페어링된 폰의 통신사 규정 + API 키 쿼터에 따름
- **지역**: 폰 통신사의 로밍 정책에 따름. 미국→한국, 한국→해외 모두 통신사 허용 시 동작

## 문제 해결

| 증상 | 원인 | 조치 |
|---|---|---|
| `503 phone_offline` | 페어링된 폰이 네트워크 단절 | 폰 온라인 확인, 앱 배터리 최적화 해제 |
| `queued` 에서 멈춤 | 배터리 최적화로 앱 강제 종료 | Textory 앱의 배터리 최적화 제외 |
| 국가 코드 오류 | E.164 형식 아님 | `+<국가코드><번호>` 로 전송 |
| 메시지 중복 | `clientId` 없이 재시도 | 모든 재시도에 동일 `clientId` 사용 |

## 폰 발송이 글로벌 앱에 적합한 이유

- 통신사 계약·국가별 등록 불필요
- 웹 SMS 게이트웨이가 비싸거나 차단된 시장에서도 동작
- 실 사용자 디바이스라 대량 게이트웨이 대상 스팸 필터에 덜 걸림
- 본인 휴대폰 요금제와 동일한 건당 비용

적합한 용도:

- 국가별 계약 없이 글로벌 2FA · OTP 전송
- 고객 지원 답장
- 실제 휴대번호로 발송하는 Verified business messaging (쇼트코드보다 답장률 높음)
