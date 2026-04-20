#!/usr/bin/env bash
# Send an SMS through the Phone channel.
# Works globally — messages are dispatched by the paired Android device's own carrier.

set -euo pipefail

: "${TEXTORY_API_KEY:?export TEXTORY_API_KEY=sk_live_...}"

curl -sS -X POST https://openapi.textory.io/openapi/v1/messages/phone \
  -H "Authorization: Bearer ${TEXTORY_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "recipients": [
      { "phoneNumber": "+14155551234", "name": "Alice" }
    ],
    "contents": "Hi {{name}}, your verification code is 917043.",
    "clientId": "'"$(uuidgen)"'"
  }'
