# Authentication

All requests to `https://openapi.textory.io` require an API key sent as a Bearer token.

## Get a key

1. Sign in at [https://pink.textory.io](https://pink.textory.io).
2. Navigate to **Settings → API Keys** (`/setting-api-keys`).
3. Click **New API Key**.
4. Select the permissions the key should have:
   - `phone_send` — Phone channel (global)
   - `web_send` — Web SMS/LMS/MMS (Korea only)
   - `kakao_send` — KakaoTalk AlimTalk (Korea only)
   - `message_history` — read your own sends
5. Copy the key. **It is shown only once.** The key prefix is `sk_live_`.

Keys can be rotated or revoked from the same page.

## Use a key

Include the key in the `Authorization` header of every request:

```
Authorization: Bearer sk_live_xxxxxxxxxxxxxxxxxxxxxx
```

Example:

```bash
curl https://openapi.textory.io/openapi/v1/account/balance \
  -H "Authorization: Bearer $TEXTORY_API_KEY"
```

## Scope a key tightly

Create one key per application or environment:

- Production backend: `web_send`, IP whitelist to your server's egress IP.
- Internal dev: `phone_send` only, no IP restriction, lower daily quota.
- CI integration tests: separate key, daily quota of 10, revoke after onboarding.

## Optional: IP whitelist

When creating a key you can provide one or more CIDR ranges. Requests from other IPs receive
`403 Forbidden` with `"code": "ip_not_allowed"`.

## Revocation

Revoked keys immediately return `403 Forbidden` with `"code": "api_key_inactive"`.
There is no grace period — rotate in advance if the key is in use.

## Security checklist

- [ ] Store keys in environment variables or a secret manager, never in source control.
- [ ] Prefix your variable names so they're grep-friendly (`TEXTORY_API_KEY`, not `APIKEY`).
- [ ] Always use HTTPS. HTTP is rejected at the load balancer.
- [ ] Scope permissions to the minimum your app needs.
- [ ] Rotate keys at least every 12 months.
- [ ] Revoke leaked keys immediately; audit `api_usage_logs` for suspicious activity.
