"""Send an SMS via the Korean web gateway. Requires pre-registered sender."""
import os
import sys

from textory_client import TextoryClient, TextoryError


def main() -> int:
    sender = os.environ.get("TEXTORY_SENDER")
    if not sender:
        print("Set TEXTORY_SENDER=+821098765432 (a registered sender number).", file=sys.stderr)
        return 1

    tx = TextoryClient()
    try:
        result = tx.send_web(
            sender=sender,
            recipients=[{"phoneNumber": "+821012345678"}],
            contents="배송이 시작되었습니다. 감사합니다.",
        )
    except TextoryError as err:
        print(f"❌ {err.status} {err.code}: {err.message}", file=sys.stderr)
        return 1

    print(result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
