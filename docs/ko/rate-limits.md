# Rate Limit · 쿼터

API 키마다 개별 쿼터가 있으며, 발급 시 설정하고 [https://www.textory.io/setting-api-keys](https://www.textory.io/setting-api-keys) 에서 조정 가능합니다.

## 쿼터 종류

| 타입 | 설명 |
|---|---|
| `per_minute` | 60초 롤링 윈도우. 기본 60 req/min |
| `daily` | UTC 기준 1일 발송 건수. 기본 10,000 |
| `monthly` | 청구 월 단위 발송 건수. 기본 300,000 |

발송 엔드포인트는 **요청 단위**로 카운트합니다. 수신자 1000명인 요청 하나는 `per_minute` 에 1건, `daily` · `monthly` 에 1000건으로 반영됩니다.

## 제한 초과 응답

한도 초과 시:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 8
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "rate_limited",
    "message": "Rate limit exceeded for 'per_minute'",
    "details": { "limit": "per_minute", "retryAfterSeconds": 8 }
  }
}
```

- `Retry-After` 값을 반드시 준수
- 429가 아닌 일시 에러는 jitter 포함 지수 backoff

## 클라이언트 구현 권장사항

### 1. 수신자 배치

한 요청에 최대 1000명까지 수용됩니다. 수신자별로 호출하지 말고 큰 요청으로 묶으세요.

### 2. 멱등 키 사용

항상 `clientId` (UUID) 를 포함하세요. 동일 `clientId` 로의 재시도는 서버에서 dedup 되므로 공격적인 재시도 루프도 안전합니다.

### 3. 429 에 대한 backoff

```js
async function withRetry(fn, attempt = 0) {
  try {
    return await fn();
  } catch (err) {
    if (err.response && err.response.status === 429 && attempt < 5) {
      const retryAfter = parseInt(err.response.headers['retry-after'] || '1', 10);
      const jitter = Math.random() * 500;
      await new Promise(r => setTimeout(r, retryAfter * 1000 + jitter));
      return withRetry(fn, attempt + 1);
    }
    throw err;
  }
}
```

### 4. 사용량 모니터링

```bash
curl https://openapi.textory.io/openapi/v1/account/balance \
  -H "Authorization: Bearer $TEXTORY_API_KEY"
```

이번 달 채널별 발송 카운트를 반환합니다.

## 쿼터 상향 요청

기본 쿼터가 부족하면 GitHub 저장소에 Issue 를 등록하거나 help@textory.io 로 다음 정보와 함께 문의하세요:

- 계정 이메일 또는 `keyId` prefix (전체 API 키는 **절대 공유 금지**)
- 예상 최대 req/min 및 일일 발송량
- 사용 사례 설명

운영 엔터프라이즈 쿼터는 통상 영업일 기준 2일 내 승인됩니다.
