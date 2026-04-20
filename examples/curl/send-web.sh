#!/usr/bin/env bash
# Send an SMS through the Web channel (Korea only).
# Requires a pre-registered sender number. Credits are deducted per message.

set -euo pipefail

: "${TEXTORY_API_KEY:?export TEXTORY_API_KEY=sk_live_...}"
: "${TEXTORY_SENDER:?export TEXTORY_SENDER=+821098765432}"

curl -sS -X POST https://openapi.textory.io/openapi/v1/messages/web \
  -H "Authorization: Bearer ${TEXTORY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "'"${TEXTORY_SENDER}"'",
    "recipients": [
      { "phoneNumber": "+821012345678" }
    ],
    "contents": "배송이 시작되었습니다. 감사합니다.",
    "clientId": "'"$(uuidgen)"'"
  }'
