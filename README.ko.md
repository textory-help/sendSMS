# Textory sendSMS — Open API

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Base URL](https://img.shields.io/badge/Base%20URL-openapi.textory.io-blue)](https://openapi.textory.io)
[![Global](https://img.shields.io/badge/Coverage-Global-brightgreen)](#지원-채널)

> 하나의 HTTP API로 SMS · LMS · MMS · 카카오 알림톡을 **전 세계** 어디에서나 발송할 수 있습니다.
> [Textory](https://textory.io)가 직접 호스팅·운영합니다.

[English README](./README.md) · **한국어**

**🌏 해외 개발자**: `/messages/phone` 로 시작하세요. 폰 발송 채널은 국가 제한이 없고 발신번호 사전 등록도 필요 없습니다. 페어링된 Textory Android 앱의 통신사 회선으로 실제 전송되기 때문입니다.

- **Base URL**: `https://openapi.textory.io`
- **인증**: `Authorization: Bearer sk_live_xxxxxxxxxxxx`
- **버저닝**: URL 프리픽스 `/openapi/v1`
- **스펙**: [`openapi.yaml`](./openapi.yaml) (OpenAPI 3.0 — Postman / Stoplight / Insomnia 에서 그대로 import)

## 빠른 시작 (60초)

### 1) API 키 발급

1. [https://www.textory.io](https://www.textory.io) 로그인
2. **환경설정 → API 키 관리** (`/setting-api-keys`) 이동
3. **새 API 키** 클릭 → 권한 선택 (`phone_send`, `web_send` 등) 후 발급
4. 생성된 키 복사 — 프리픽스 `sk_live_` 로 시작. **발급 시 1회만 표시되므로 즉시 저장**
5. 환경변수 `TEXTORY_API_KEY` 로 저장 (소스 코드에 하드코딩 금지)

### 2) 첫 SMS 발송 (curl)

```bash
curl -X POST https://openapi.textory.io/openapi/v1/messages/phone \
  -H "Authorization: Bearer $TEXTORY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [
      { "phoneNumber": "+821012345678" }
    ],
    "contents": "Textory Open API 테스트 발송입니다."
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

## 지원 채널

| 채널 | 엔드포인트 | 커버리지 | 요구 조건 | 과금 |
|---|---|---|---|---|
| **폰 발송** | `POST /openapi/v1/messages/phone` | 🌏 전 세계 (페어링된 폰 경유) | Android 앱 로그인·온라인 | 휴대폰 요금제의 SMS/MMS 요금 |
| **웹 발송** | `POST /openapi/v1/messages/web` | 🇰🇷 한국 한정 | 발신번호 사전 등록 | **크레딧 차감** |
| **카카오 알림톡** | `POST /openapi/v1/messages/kakao` | 🇰🇷 한국 한정 | 템플릿 승인 + senderKey | **크레딧 차감** |

채널별 상세:

- [폰 발송](./docs/ko/phone-send.md)
- [웹 발송](./docs/ko/web-send.md) *(한국 전용)*
- [카카오 알림톡](./docs/ko/kakao-send.md) *(한국 전용, Phase 2)*

## 핵심 문서

- [인증](./docs/ko/authentication.md)
- [에러 코드](./docs/ko/errors.md)
- [Rate Limit · 쿼터](./docs/ko/rate-limits.md)

## 샘플 코드

7개 언어의 바로 실행 가능한 예제:

- [cURL](./examples/curl)
- [Node.js (axios + TypeScript 타입)](./examples/nodejs)
- [Python (requests)](./examples/python)
- [Java (OkHttp)](./examples/java)
- [PHP (cURL)](./examples/php)
- [Go (net/http)](./examples/go)
- [Ruby (Net::HTTP)](./examples/ruby)

각 디렉터리에 자체 `README.md`와 설치·실행 방법이 포함되어 있습니다.

## Postman / Insomnia

[`postman/textory-sendsms.postman_collection.json`](./postman/textory-sendsms.postman_collection.json) 또는 [OpenAPI 스펙](./openapi.yaml)을 바로 import 하세요.

## 주요 엔드포인트

| 메서드 | 경로 | 설명 |
|---|---|---|
| `POST` | `/openapi/v1/messages/phone` | 폰 채널 발송 (전 세계) |
| `POST` | `/openapi/v1/messages/web` | 웹 채널 발송 (한국 한정) |
| `POST` | `/openapi/v1/messages/kakao` | 카카오 알림톡 (한국 한정) |
| `GET`  | `/openapi/v1/messages/{id}` | 메시지 상태 조회 |
| `GET`  | `/openapi/v1/senders` | 등록된 발신번호 목록 |
| `GET`  | `/openapi/v1/account/balance` | 현재 크레딧 잔액 |

## 응답 포맷

모든 응답은 동일한 envelope 로 감쌉니다:

```jsonc
// 성공
{ "success": true, "data": { /* ... */ } }

// 실패
{ "success": false, "error": { "code": "invalid_sender", "message": "...", "details": { } } }
```

상세한 코드 목록은 [에러 문서](./docs/ko/errors.md) 참조.

## Rate Limit

API 키별로 일일/월간/분당 한도를 설정할 수 있습니다. 초과 시 `429 Too Many Requests` 와 `Retry-After` 헤더가 반환됩니다. [rate-limits.md](./docs/ko/rate-limits.md) 참조.

## 보안 권장사항

- 항상 **HTTPS** 사용 (HTTP 요청은 거부)
- 키는 환경변수 또는 시크릿 매니저 (Vault, AWS Secrets Manager, Doppler 등) 에 저장
- 필요한 권한만 부여 (예: `phone_send` 만)
- 서버 전용 키라면 발급 시 **IP 화이트리스트** 설정
- 주기적으로 키 로테이션
- 유출된 키는 즉시 Settings → API Keys 에서 revoke

## 지원

- **이슈 · 버그 제보**: 본 GitHub 저장소에 Issue 등록
- **이메일**: help@textory.io

## 라이선스

[MIT](./LICENSE) — 본 저장소의 예제 코드와 문서는 자유롭게 복사·수정·재배포 가능합니다. Textory Open API 서비스 자체는 별도의 [이용약관](https://textory.io/terms)을 따릅니다.
