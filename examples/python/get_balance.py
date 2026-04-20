"""Check your credit balance and monthly usage."""
import os

from textory_client import TextoryClient

tx = TextoryClient()
data = tx.get_balance()["data"]

print(f"Balance: ₩{data['balanceKrw']:,}")
print(
    f"This month — SMS: {data['monthlySentSms']}, "
    f"LMS: {data['monthlySentLms']}, MMS: {data['monthlySentMms']}, "
    f"Kakao: {data['monthlySentKakao']}"
)
