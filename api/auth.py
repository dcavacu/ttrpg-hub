# -*- coding: utf-8 -*-
"""Verifies this app's session cookie. Vercel Python functions under /api/*
are routed independently of the Next.js app (middleware.ts never sees these
requests), so this endpoint has to check the session itself instead of
relying on that gate. Must stay byte-for-byte compatible with the JS
implementation in lib/auth/session.ts -- same token shape, same HMAC.
"""
import base64
import hashlib
import hmac as hmac_lib
import os

SESSION_COOKIE_NAME = "ttrpg_hub_session"


def _b64url_decode(value):
    padded = value + "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(padded.encode("ascii")).decode("utf-8")


def _hmac_hex(secret, value):
    return hmac_lib.new(secret.encode("utf-8"), value.encode("utf-8"), hashlib.sha256).hexdigest()


def verify_session(cookie_value):
    """Returns the username if cookie_value is a valid session token, else None."""
    secret = os.environ.get("SITE_PASSWORD", "")
    if not secret or not cookie_value or "." not in cookie_value:
        return None
    encoded_username, signature = cookie_value.split(".", 1)
    expected = _hmac_hex(secret, encoded_username)
    if not hmac_lib.compare_digest(signature, expected):
        return None
    try:
        return _b64url_decode(encoded_username)
    except Exception:
        return None
