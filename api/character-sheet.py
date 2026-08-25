# -*- coding: utf-8 -*-
"""Vercel Python serverless function: POST an uploaded portrait + accent color
+ class choice, get back a filled Nimble character sheet PDF. Reuses
sheet_engine.build() (the user's own PDF engine) unmodified except for how the
portrait and accent color are supplied -- see sheet_engine.py's module docstring
history for what changed and why.
"""
import io
import os
import tempfile

from flask import Flask, abort, request, send_file

from auth import SESSION_COOKIE_NAME, verify_session
from class_configs import CLASS_CONFIGS
from sheet_engine import build

app = Flask(__name__)


def hex_to_rgb01(hex_color):
    hex_color = (hex_color or "").lstrip("#")
    if len(hex_color) != 6:
        return None
    try:
        r = int(hex_color[0:2], 16) / 255
        g = int(hex_color[2:4], 16) / 255
        b = int(hex_color[4:6], 16) / 255
    except ValueError:
        return None
    return (r, g, b)


@app.route("/api/character-sheet", methods=["POST"])
def generate():
    # This function is routed independently of the Next.js app, so
    # middleware.ts's login gate never sees this request -- check the
    # session cookie ourselves instead of trusting that gate to cover it.
    if not verify_session(request.cookies.get(SESSION_COOKIE_NAME)):
        abort(401)

    class_key = (request.form.get("class") or "").strip().lower()
    base_config = CLASS_CONFIGS.get(class_key)
    if not base_config:
        abort(400, "Unknown class: %r" % class_key)

    config = dict(base_config)  # never mutate the shared module-level dict
    accent = hex_to_rgb01(request.form.get("color", ""))
    if accent:
        config["accent"] = accent

    portrait_bytes = None
    portrait_file = request.files.get("portrait")
    if portrait_file and portrait_file.filename:
        portrait_bytes = portrait_file.read()

    tmp = tempfile.NamedTemporaryFile(suffix=".pdf", delete=False)
    out_path = tmp.name
    tmp.close()
    try:
        build(config, out_path, portrait_bytes=portrait_bytes)
        with open(out_path, "rb") as f:
            pdf_bytes = f.read()
    finally:
        try:
            os.remove(out_path)
        except OSError:
            pass

    filename = "%s_Character_Sheet.pdf" % config["name"].title().replace(" ", "_")
    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=filename,
    )
