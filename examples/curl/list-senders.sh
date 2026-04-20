#!/usr/bin/env bash
# List sender numbers approved for Web/Kakao sending.

set -euo pipefail

: "${TEXTORY_API_KEY:?export TEXTORY_API_KEY=sk_live_...}"

curl -sS https://openapi.textory.io/openapi/v1/senders \
  -H "Authorization: Bearer ${TEXTORY_API_KEY}"
