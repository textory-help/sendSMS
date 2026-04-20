# 인증

`https://openapi.textory.io` 로의 모든 요청은 Bearer 토큰 형태의 API 키가 필요합니다.

## 키 발급

1. [https://www.textory.io](https://www.textory.io) 로그인
2. **환경설정 → API 키 관리** (`/setting-api-keys`) 이동
3. **새 API 키** 클릭
4. 키에 부여할 권한 선택
   - `phone_send` — 폰 채널 (전 세계)
   - `web_send` — 웹 SMS/LMS/MMS (한국 한정)
   - `kakao_send` — 카카오 알림톡 (한국 한정)
   - `message_history` — 본인 발송 이력 조회
5. 생성된 키 복사. **생성 시 딱 한 번만 표시됩니다.** 프리픽스 `sk_live_`

동일 페이지에서 키 로테이션·폐기(revoke)도 가능합니다.

## 키 사용

모든 요청의 `Authorization` 헤더에 포함:

```
Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxxxx
```

예시:

```bash
curl https://openapi.textory.io/openapi/v1/account/balance \
  -H "Authorization: Bearer $TEXTORY_API_KEY"
```

## 키를 용도별로 분리 발급

애플리케이션 · 환경별로 키를 나누세요:

- **운영 백엔드**: `web_send`, 서버 egress IP 에 대한 IP 화이트리스트
- **내부 개발**: `phone_send` 만, IP 제한 없이 낮은 일일 쿼터
- **CI 통합 테스트**: 별도 키, 일일 10건, 온보딩 후 revoke

## 선택 옵션: IP 화이트리스트

키 생성 시 하나 이상의 CIDR 대역을 지정할 수 있습니다. 그 외 IP에서의 요청은 `403 Forbidden` + `"code": "ip_not_allowed"` 로 거부됩니다.

## 키 폐기

폐기된 키는 즉시 `403 Forbidden` + `"code": "api_key_inactive"` 를 반환합니다. Grace period 가 없으므로 **사용 중이라면 로테이션을 먼저** 수행하세요.

## 보안 체크리스트

- [ ] 키는 환경변수 또는 시크릿 매니저에 저장, 절대 소스 컨트롤에 커밋하지 않음
- [ ] 변수명은 검색이 쉽도록 prefix 사용 (`TEXTORY_API_KEY`, not `APIKEY`)
- [ ] 항상 HTTPS 사용 (로드밸런서 레벨에서 HTTP 거부)
- [ ] 필요한 최소 권한만 부여
- [ ] 최소 12개월에 한 번씩 로테이션
- [ ] 유출 의심 시 즉시 revoke 후 `api_usage_logs` 감사
