#!/usr/bin/env bash
# Check remaining credit balance and monthly usage.

set -euo pipefail

: "${TEXTORY_API_KEY:?export TEXTORY_API_KEY=sk_live_...}"

curl -sS https://openapi.textory.io/openapi/v1/account/balance \
  -H "Authorization: Bearer ${TEXTORY_API_KEY}"
