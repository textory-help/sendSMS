"""Send an SMS via the paired phone (works globally)."""
import os
import sys

from textory_client import TextoryClient, TextoryError


def main() -> int:
    tx = TextoryClient()
    try:
        result = tx.send_phone(
            recipients=[{"phoneNumber": "+14155551234", "name": "Alice"}],
            contents="Hi {{name}}, your verification code is 917043.",
        )
    except TextoryError as err:
        print(f"❌ {err.status} {err.code}: {err.message}", file=sys.stderr)
        if err.details:
            print(f"  details: {err.details}", file=sys.stderr)
        return 1

    print("✅ Sent:")
    print(result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
