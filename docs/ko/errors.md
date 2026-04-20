# 에러 코드

모든 에러는 동일한 envelope 형식으로 반환됩니다:

```json
{
  "success": false,
  "error": {
    "code": "sender_not_registered",
    "message": "발신번호가 등록/인증되지 않았습니다",
    "details": { "sender": "+821012345678" }
  }
}
```

HTTP 상태 코드와 `error.code` 조합으로 에러를 식별합니다.

## 400 Bad Request — 클라이언트 에러

| `code` | 의미 | 해결 |
|---|---|---|
| `invalid_request` | 요청 본문 검증 실패. `details.field` 확인 | 해당 필드 수정 |
| `missing_recipients` | `recipients` 누락 또는 빈 배열 | 최소 1명 이상 지정 |
| `missing_contents` | `contents` 누락 또는 빈 문자열 | 비어있지 않은 본문 지정 |
| `invalid_phone_number` | E.164 형식 아님 | `+<국가><번호>` 형식 사용 |
| `unsupported_country` | 웹/알림톡에 비한국 번호 전송 | 해외는 `/messages/phone` 사용 |
| `sender_not_registered` | 웹/알림톡 발신번호 미승인 | 대시보드에서 등록·통신사 승인 대기 |
| `contents_too_long` | 본문이 2000 bytes(LMS 한도) 초과 | 분할 발송 또는 MMS 사용 |
| `attachment_too_large` | MMS 이미지 300 KB 초과 또는 포맷 불일치 | 압축 또는 JPG/PNG 변환 |
| `invalid_reserved_at` | 과거 시점 또는 90일 초과 | 90일 이내 미래 ISO 8601 사용 |
| `invalid_template` | 카카오 `templateCode` 미승인 | 카카오 비즈니스 센터 확인 |
| `variables_mismatch` | 카카오 템플릿 변수 불일치 | 승인 템플릿에 맞게 조정 |

## 401 Unauthorized

| `code` | 의미 | 해결 |
|---|---|---|
| `unauthorized` | `Authorization` 헤더 누락 | `Authorization: Bearer sk_live_...` 전송 |
| `invalid_api_key` | 키 인식 불가 | 대시보드에서 키 재발급 |

## 402 Payment Required

| `code` | 의미 | 해결 |
|---|---|---|
| `insufficient_balance` | 크레딧 부족 (웹/알림톡) | 대시보드에서 충전 |

## 403 Forbidden

| `code` | 의미 | 해결 |
|---|---|---|
| `api_key_inactive` | 폐기되거나 비활성화된 키 | 새 키 발급 |
| `permission_denied` | 키에 해당 권한 없음 | 올바른 권한으로 재발급 |
| `ip_not_allowed` | 요청 IP 가 화이트리스트에 없음 | 대시보드에서 IP 추가 또는 허용 IP 에서 호출 |

## 404 Not Found

| `code` | 의미 | 해결 |
|---|---|---|
| `message_not_found` | `messageId` 없음 또는 타 계정 소유 | 발송 응답에서 받은 ID 확인 |

## 409 Conflict — 멱등성 replay

`409` 는 **에러가 아닙니다**. `clientId` 가 이전에 접수된 요청과 일치해 서버가 기존 메시지를 반환했다는 뜻입니다. 성공으로 처리하세요.

## 429 Too Many Requests

응답 헤더에 `Retry-After: <seconds>` 포함. 지수 backoff 를 구현하세요.

## 500 / 502 / 503 서버 에러

일시적인 서버 장애입니다. `GET` 은 즉시 재시도 안전. `POST` 는 **동일한 `clientId`** 로 재시도해 중복을 방지하세요.

## 503 phone_offline

폰 채널 전용. 페어링된 Android 앱과 연결이 끊어진 상태입니다. 조치:

- 네트워크가 복구되면 앱이 자동 재연결 — 대기
- 폰 소유자에게 앱을 전경(foreground) 으로 올리거나 배터리 최적화 설정 확인 요청
