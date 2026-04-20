# Python examples

Requires Python ≥ 3.9.

```bash
cd examples/python
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

export TEXTORY_API_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxx

python send_phone.py               # global SMS via paired phone
TEXTORY_SENDER=+821098765432 \
  python send_web.py               # Korean web SMS
python get_balance.py
```

## Files

- `textory_client.py` — reusable client with idempotent retries, `TextoryError` for clean
  error handling.
- `send_phone.py`, `send_web.py`, `get_balance.py` — runnable examples.

## Installing as a package (optional)

Drop `textory_client.py` into your project, or publish it as an internal package.
There is no official PyPI package yet; track [issue #1](https://github.com/textory-help/sendSMS/issues) for updates.
