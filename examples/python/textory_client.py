"""Minimal Textory Open API client.

Usage:
    from textory_client import TextoryClient
    tx = TextoryClient(os.environ["TEXTORY_API_KEY"])
    tx.send_phone(recipients=[{"phoneNumber": "+14155551234"}], contents="Hi!")
"""
from __future__ import annotations

import os
import random
import time
import uuid
from typing import Any

import requests

_DEFAULT_BASE_URL = "https://openapi.textory.io"
_MAX_RETRIES = 3


class TextoryError(Exception):
    def __init__(self, status: int, code: str, message: str, details: dict | None = None):
        super().__init__(f"{status} {code}: {message}")
        self.status = status
        self.code = code
        self.message = message
        self.details = details or {}


class TextoryClient:
    def __init__(
        self,
        api_key: str | None = None,
        base_url: str = _DEFAULT_BASE_URL,
        timeout: float = 30.0,
    ) -> None:
        api_key = api_key or os.environ.get("TEXTORY_API_KEY")
        if not api_key:
            raise ValueError("api_key is required (TEXTORY_API_KEY env var)")
        self._base_url = base_url.rstrip("/")
        self._timeout = timeout
        self._session = requests.Session()
        self._session.headers.update(
            {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
                "User-Agent": "textory-python/1.0",
            }
        )

    # ---- Send endpoints ----

    def send_phone(self, **body: Any) -> dict:
        """Send via the paired phone — works globally."""
        return self._post_with_retry("/openapi/v1/messages/phone", self._with_client_id(body))

    def send_web(self, *, sender: str, **body: Any) -> dict:
        """Send via the Korean web gateway. Sender must be pre-registered."""
        body["sender"] = sender
        return self._post_with_retry("/openapi/v1/messages/web", self._with_client_id(body))

    def send_kakao(self, *, sender_key: str, template_code: str, **body: Any) -> dict:
        """Send a KakaoTalk AlimTalk message. Korea only."""
        body.update({"senderKey": sender_key, "templateCode": template_code})
        return self._post_with_retry("/openapi/v1/messages/kakao", self._with_client_id(body))

    # ---- Read endpoints ----

    def get_message(self, message_id: str) -> dict:
        return self._get(f"/openapi/v1/messages/{message_id}")

    def list_senders(self) -> dict:
        return self._get("/openapi/v1/senders")

    def get_balance(self) -> dict:
        return self._get("/openapi/v1/account/balance")

    # ---- Internals ----

    @staticmethod
    def _with_client_id(body: dict) -> dict:
        if "clientId" not in body:
            body = {**body, "clientId": str(uuid.uuid4())}
        return body

    def _get(self, path: str) -> dict:
        r = self._session.get(self._base_url + path, timeout=self._timeout)
        return self._unwrap(r)

    def _post_with_retry(self, path: str, body: dict) -> dict:
        url = self._base_url + path
        attempt = 0
        while True:
            r = self._session.post(url, json=body, timeout=self._timeout)
            status = r.status_code

            if status == 429 and attempt < _MAX_RETRIES:
                retry_after = int(r.headers.get("Retry-After", "1"))
                time.sleep(retry_after + random.uniform(0, 0.5))
                attempt += 1
                continue

            if status >= 500 and attempt < _MAX_RETRIES:
                time.sleep(0.3 * (2 ** attempt) + random.uniform(0, 0.3))
                attempt += 1
                continue

            return self._unwrap(r)

    @staticmethod
    def _unwrap(r: requests.Response) -> dict:
        # 409 is idempotent replay — treat as success.
        if r.ok or r.status_code == 409:
            return r.json()
        try:
            payload = r.json()
            err = payload.get("error", {})
            raise TextoryError(
                status=r.status_code,
                code=err.get("code", "unknown"),
                message=err.get("message", r.text),
                details=err.get("details"),
            )
        except ValueError:
            raise TextoryError(r.status_code, "http_error", r.text)
