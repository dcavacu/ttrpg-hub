# -*- coding: utf-8 -*-
"""Standalone copy of sheet_engine.py with the levels/upgrades (feature box,
upgrade grid, capstone) drawing code removed entirely, and page 1 rebuilt
around a five-column layout:

    left    (10-180)      the whole "stat block": identity fields, HP, the
                           level/armor/speed/init row, ability scores, skills
    mid     (192-428)     resource banner, portrait, subclass & abilities,
                           inventory, wounds
    notes   (440-980)     one joined box (a divider splits it into two
                           independently-fillable free-write halves)
    newbie  (992-1160)    optional new-player help column; only exists (and
                           only widens the page) when CONFIG["newbie_help"]
                           is truthy

Page width was widened past US Letter (792pt) to give the page-2 spellbook
grid and the page-3 reference boxes more breathing room -- that pulled the
notes box and newbie column out wider along with it (BASE_PAGE_W drives all
three).

This is a reference/starting point to edit separately -- it is NOT imported
by anything and the class_*.py scripts do not use it.
"""

import io
import math
import re

import pikepdf
from reportlab.lib import colors
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas

# --------------------------------------------------------------------------
# geometry (landscape US Letter, points -- wider when the newbie column is on)
# --------------------------------------------------------------------------
PAGE_H = 612
BASE_PAGE_W = 992

left_start, left_end = 10, 180            # stats / skills column
mid_start, mid_end = 192, 428             # portrait / inventory / wounds / subclass & abilities
note0_start, note1_end = 440, 980         # joined notes box (divider sits at the midpoint)
newbie_start, newbie_end = 992, 1160      # newbie help column, optional
WIDE_PAGE_W = newbie_end + 12

GAP = 5
LEVEL_TOP_NO_BANNER = 600
BANNER_Y0, BANNER_Y1 = 575, 604

SKILLS = [
    ("Arcana", "INT"), ("Examination", "INT"), ("Finesse", "DEX"),
    ("Influence", "WIL"), ("Insight", "WIL"), ("Lore", "INT"),
    ("Might", "STR"), ("Naturecraft", "WIL"), ("Perception", "WIL"),
    ("Stealth", "DEX"),
]
STATS = ["STR", "DEX", "INT", "WIL"]

# Condensed from the Core Rules -- what a hero can do on their own turn
# (p.13, "Heroic Actions") and on someone else's (p.14, "Heroic Reactions").
# Printed fixed text for the optional newbie-help column, not an editable
# field: each section is (heading, intro, [(entry title, body), ...]).
NEWBIE_HELP_SECTIONS = [
    (
        "ON YOUR TURN",
        "You get 3 Actions each turn -- attack, move, cast a spell, etc. "
        "They all recharge at the end of your turn.",
        [
            ("Attack.", "Roll the die on your weapon, spell, or ability. "
                         "Roll a 1 and you miss. Roll the max value and "
                         "it's a crit -- reroll that die and add it to the "
                         "total."),
            ("Cast a Spell.", "Costs mana equal to the spell's tier "
                               "(cantrips are free). Needs a free hand and "
                               "the ability to speak."),
            ("Move.", "Move up to your Speed. You can split it across "
                       "multiple actions instead of using it all at once."),
            ("Assess.", "DC 12 check to ask a question, create an opening "
                         "(+1 to the next Primary Die rolled against a "
                         "target), or anticipate danger (-1 to Primary Dice "
                         "against you this round)."),
            ("Free Actions.", "Simple stuff (open an unlocked door, drop an "
                               "item, shout a phrase) costs no action, "
                               "1/turn."),
        ],
    ),
    (
        "REACTIONS",
        "Cost 1 action but happen on someone else's turn. Max 1/round each.",
        [
            ("Defend.", "Reduce damage from one attack against you by your "
                         "Armor."),
            ("Interpose.", "Push an ally within 2 spaces out of an attack's "
                            "way and become the new target yourself."),
            ("Opportunity Attack.", "A disadvantaged melee attack against "
                                     "an adjacent enemy as it willingly "
                                     "moves away. Heroes only."),
            ("Help.", "Grant an ally advantage on a roll if you can explain "
                       "how you'd help (1/roll)."),
        ],
    ),
]


# --------------------------------------------------------------------------
# small helpers
# --------------------------------------------------------------------------
def tint(rgb, amount):
    """Blend rgb toward white; amount 0 = white, 1 = full color."""
    r, g, b = rgb
    return (1 - (1 - r) * amount, 1 - (1 - g) * amount, 1 - (1 - b) * amount)


def col(rgb):
    return colors.Color(*rgb)


def clean_field_name(title):
    """'Rage.' -> 'Rage', "That All You Got?!" -> 'That All You Got'."""
    return title.rstrip(".!?").strip()


def wrap_text(text, font, size, max_width):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        trial = (cur + " " + w).strip()
        if not cur or stringWidth(trial, font, size) <= max_width:
            cur = trial
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [""]


# --------------------------------------------------------------------------
# background
# --------------------------------------------------------------------------
def draw_checker_background(c, accent, page_w=BASE_PAGE_W, cell=24):
    light = col(tint(accent, 0.08))
    lighter = col(tint(accent, 0.16))
    cols = int(page_w // cell) + 1
    rows = int(PAGE_H // cell) + 1
    for gy in range(rows):
        for gx in range(cols):
            c.setFillColor(light if (gx + gy) % 2 == 0 else lighter)
            c.rect(gx * cell, gy * cell, cell, cell, stroke=0, fill=1)


# --------------------------------------------------------------------------
# generic widgets
# --------------------------------------------------------------------------
def label(c, x, y, text, size=7, font="Helvetica", color=colors.Color(0.35, 0.35, 0.35)):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawString(x, y, text)


def label_centered(c, cx, y, text, size=7, font="Helvetica", color=colors.Color(0.35, 0.35, 0.35)):
    c.setFont(font, size)
    c.setFillColor(color)
    c.drawCentredString(cx, y, text)


RADIUS = 3


def rounded_box(c, x, y, w, h, radius=RADIUS, fill=colors.white, stroke=colors.black, lw=1):
    """A plain rounded rectangle drawn straight onto the page content -- the
    box border/fill you actually see. The AcroForm widgets themselves stay
    borderless/transparent overlays, matching the source sheets (their field
    annotations carry no /MK or /BS at all; every visible box is hand-drawn)."""
    r = min(radius, w / 2, h / 2)
    if stroke is not None:
        c.setLineWidth(lw)
        c.setStrokeColor(stroke)
    if fill is not None:
        c.setFillColor(fill)
    c.roundRect(x, y, w, h, r, stroke=1 if stroke is not None else 0,
                fill=1 if fill is not None else 0)


def ruled_lines(c, x, y0, y1, x1, first_gap=9, step=13.5):
    """Faint notebook-style ruling inside a multiline box."""
    c.setLineWidth(0.5)
    c.setStrokeColor(colors.Color(0, 0, 0, alpha=0.15))
    y = y1 - first_gap
    while y > y0 + 4:
        c.line(x + 4, y, x1 - 4, y)
        y -= step


def _mark_center(c, name):
    """reportlab's textfield() has no alignment param -- the /Q centering is
    applied afterwards in a pikepdf post-process pass, so field creation just
    has to remember which names asked for it."""
    if not hasattr(c, "_center_fields"):
        c._center_fields = set()
    c._center_fields.add(name)


def text_field(c, name, x, y0, x1, y1, size=9, multiline=False, value="",
                radius=RADIUS, ruled=None, fill=colors.white, align="left"):
    rounded_box(c, x, y0, x1 - x, y1 - y0, radius=radius, fill=fill)
    if ruled is None:
        ruled = multiline
    if ruled:
        ruled_lines(c, x, y0, y1, x1)
    if align == "center":
        _mark_center(c, name)
    c.acroForm.textfield(
        name=name, x=x, y=y0, width=x1 - x, height=y1 - y0,
        fontName="Helvetica", fontSize=size, value=value,
        borderStyle="solid", borderWidth=0, borderColor=None,
        fillColor=None, textColor=colors.black,
        fieldFlags="multiline" if multiline else "",
        forceBorder=False, maxlen=None,  # reportlab defaults to a 100-char
        # cap on EVERY field unless overridden -- fine for "Name", useless
        # for a page of Inventory/Notes text; None omits /MaxLen entirely.
    )


def tri_checkbox(c, name, x, y, size=9, up=True):
    """Advantage/disadvantage checkbox drawn as a small triangle."""
    c.setLineWidth(0.75)
    c.setStrokeColor(colors.black)
    c.setFillColor(colors.white)
    p = c.beginPath()
    if up:
        p.moveTo(x + size / 2, y + size)
        p.lineTo(x, y)
        p.lineTo(x + size, y)
    else:
        p.moveTo(x, y + size)
        p.lineTo(x + size, y + size)
        p.lineTo(x + size / 2, y)
    p.close()
    c.drawPath(p, stroke=1, fill=1)
    c.acroForm.checkbox(
        name=name, x=x, y=y, size=size, checked=False,
        buttonStyle="check", borderWidth=0,
        fillColor=None, borderColor=None, fieldFlags="",
    )


def circle_checkbox(c, name, x, y, size, dashed=False):
    c.setLineWidth(0.75)
    c.setStrokeColor(colors.black)
    c.setFillColor(colors.white)
    if dashed:
        c.saveState()
        c.setDash(1.5, 1.5)
    c.ellipse(x, y, x + size, y + size, stroke=1, fill=1)
    if dashed:
        c.restoreState()
    c.acroForm.checkbox(
        name=name, x=x, y=y, size=size, checked=False,
        buttonStyle="circle", borderWidth=0,
        fillColor=None, borderColor=None, fieldFlags="",
    )


def tag(c, x, y, text, accent, size=7):
    """Small colored 'INVENTORY' style tab sitting mostly above a box's top
    edge, dipping only slightly into it so it never crowds the box's own
    content (ruled lines / first line of text)."""
    w = stringWidth(text, "Helvetica-Bold", size) + 10
    h = 12
    dip = h * 0.28
    c.setFillColor(col(accent))
    c.roundRect(x, y - dip, w, h, 2, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x + 5, y - dip + h / 2 - 2.8, text)
    return w


def bare_field(c, name, x, y0, x1, y1, size=9, multiline=True, value="", ruled=False,
                first_gap=9):
    """An AcroForm field with no box of its own -- for layering onto a card
    whose border/fill was already drawn (e.g. by header_card)."""
    if ruled:
        ruled_lines(c, x, y0, y1, x1, first_gap=first_gap)
    c.acroForm.textfield(
        name=name, x=x, y=y0, width=x1 - x, height=y1 - y0,
        fontName="Helvetica", fontSize=size, value=value,
        borderStyle="solid", borderWidth=0, borderColor=None,
        fillColor=None, textColor=colors.black,
        fieldFlags="multiline" if multiline else "",
        forceBorder=False, maxlen=None,  # reportlab defaults to a 100-char
        # cap on EVERY field unless overridden -- fine for "Name", useless
        # for a page of Inventory/Notes text; None omits /MaxLen entirely.
    )


def header_card(c, x0, x1, y_bottom, y_top, header_h, text, field_name,
                 size=11, header_fill=colors.black, subtitle=None,
                 subtitle_size=8, radius=None, ruled=True, value=""):
    """The engine's one visual building block: a rounded card with a solid
    label header on top and a bordered body below. field_name=None just
    draws the frame, letting the caller lay its own content/field on top."""
    w, h = x1 - x0, y_top - y_bottom
    r = radius if radius is not None else min(RADIUS + 1, w / 2, h / 2)
    c.saveState()
    p = c.beginPath()
    p.roundRect(x0, y_bottom, w, h, r)
    c.clipPath(p, stroke=0, fill=0)
    c.setFillColor(colors.white)
    c.rect(x0, y_bottom, w, h, stroke=0, fill=1)
    c.setFillColor(header_fill)
    c.rect(x0, y_top - header_h, w, header_h, stroke=0, fill=1)
    c.restoreState()
    c.setLineWidth(1)
    c.setStrokeColor(colors.black)
    c.roundRect(x0, y_bottom, w, h, r, stroke=1, fill=0)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x0 + 8, y_top - header_h / 2 - size * 0.32, text)
    if subtitle:
        c.setFont("Helvetica-Oblique", subtitle_size)
        c.drawRightString(x1 - 8, y_top - header_h / 2 - subtitle_size * 0.32, subtitle)

    body_top = y_top - header_h
    if field_name:
        bare_field(c, field_name, x0, y_bottom, x1, body_top, value=value, ruled=ruled)
    return body_top


def joined_two_field_card(c, x0, x1, y_bottom, y_top, header_h, title, field1, field2,
                           header_fill=colors.black, size=11):
    """One unified rounded card (single outer border, single title) split by
    a divider into two independently-named, independently fillable halves --
    for 'these should look like one box but stay two separate fields'."""
    w, h = x1 - x0, y_top - y_bottom
    r = min(RADIUS + 1, w / 2, h / 2)
    c.saveState()
    p = c.beginPath()
    p.roundRect(x0, y_bottom, w, h, r)
    c.clipPath(p, stroke=0, fill=0)
    c.setFillColor(colors.white)
    c.rect(x0, y_bottom, w, h, stroke=0, fill=1)
    c.setFillColor(header_fill)
    c.rect(x0, y_top - header_h, w, header_h, stroke=0, fill=1)
    c.restoreState()
    c.setLineWidth(1)
    c.setStrokeColor(colors.black)
    c.roundRect(x0, y_bottom, w, h, r, stroke=1, fill=0)

    mid_x = (x0 + x1) / 2
    c.setLineWidth(1)
    c.setStrokeColor(colors.black)
    c.line(mid_x, y_bottom, mid_x, y_top - header_h)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x0 + 8, y_top - header_h / 2 - size * 0.32, title)

    body_top = y_top - header_h
    # first ruled line sits a half-letter lower than the default gap, so the
    # first line typed lands on it instead of floating above it
    bare_field(c, field1, x0, y_bottom, mid_x - 3, body_top, ruled=True, first_gap=13.5)
    bare_field(c, field2, mid_x + 3, y_bottom, x1, body_top, ruled=True, first_gap=13.5)
    return body_top


def draw_newbie_column(c, x0, x1, accent, sections, title="QUICK REFERENCE"):
    """Fixed, permanently-printed reference text (Core Rules p.13-14,
    'Heroic Actions' / 'Heroic Reactions') -- not a fillable field, unlike
    everything else on the sheet. `sections` is a list of
    (heading, intro, [(entry title, body), ...])."""
    y_bottom, y_top, header_h = 11, 601, 20
    w, h = x1 - x0, y_top - y_bottom
    r = min(RADIUS + 1, w / 2, h / 2)

    c.saveState()
    p = c.beginPath()
    p.roundRect(x0, y_bottom, w, h, r)
    c.clipPath(p, stroke=0, fill=0)
    c.setFillColor(colors.white)
    c.rect(x0, y_bottom, w, h, stroke=0, fill=1)
    c.setFillColor(col(accent))
    c.rect(x0, y_top - header_h, w, header_h, stroke=0, fill=1)
    c.restoreState()
    c.setLineWidth(1)
    c.setStrokeColor(colors.black)
    c.roundRect(x0, y_bottom, w, h, r, stroke=1, fill=0)

    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(x0 + 8, y_top - header_h / 2 - 3.5, title)

    ty = y_top - header_h - 14
    for heading, intro, entries in sections:
        c.setFont("Helvetica-BoldOblique", 10)
        c.setFillColor(col(accent))
        c.drawString(x0 + 8, ty, heading)
        ty -= 13

        if intro:
            c.setFont("Helvetica-Oblique", 7.5)
            c.setFillColor(colors.Color(0.4, 0.4, 0.4))
            for line in wrap_text(intro, "Helvetica-Oblique", 7.5, w - 16):
                c.drawString(x0 + 8, ty, line)
                ty -= 9.5
            ty -= 8

        for entry_title, body in entries:
            c.setFont("Helvetica-Bold", 9)
            c.setFillColor(colors.black)
            c.drawString(x0 + 8, ty, entry_title)
            ty -= 11
            c.setFont("Helvetica", 8.5)
            for line in wrap_text(body, "Helvetica", 8.5, w - 16):
                c.drawString(x0 + 8, ty, line)
                ty -= 10.5
            ty -= 8
        ty -= 6


# --------------------------------------------------------------------------
# page 1
# --------------------------------------------------------------------------
def draw_resource_banner(config, accent):
    """Return a function(c) drawing the page-1 resource banner, or None."""
    mode = config.get("resource_mode", "dice")
    charges_label = config.get("charges_label")

    if mode == "dice":
        n = config.get("dice_slots", 5)

        def draw(c):
            banner_h = BANNER_Y1 - BANNER_Y0
            rounded_box(c, mid_start, BANNER_Y0, mid_end - mid_start, banner_h,
                        radius=RADIUS + 2, fill=col(accent), stroke=None)
            c.setFillColor(colors.white)
            c.setFont("Helvetica-BoldOblique", 15)
            c.drawString(mid_start + 10, BANNER_Y0 + (banner_h - 10.8) / 2, config.get("resource", ""))
            right = mid_end - 5
            slot_h = 12
            slot_y0 = BANNER_Y0 + (banner_h - slot_h) / 2
            for i in range(n, 0, -1):
                x1 = right - (n - i) * 24
                x0 = x1 - 18
                fill = colors.white if i % 2 else col(tint(accent, 0.15))
                text_field(c, "Slot %d" % i, x0, slot_y0, x1, slot_y0 + slot_h,
                           size=9, radius=2, fill=fill)
        return draw

    if "charges_label" in config:
        def draw(c):
            banner_h = BANNER_Y1 - BANNER_Y0
            rounded_box(c, mid_start, BANNER_Y0, mid_end - mid_start, banner_h,
                        radius=RADIUS + 2, fill=col(accent), stroke=None)
            c.setFillColor(colors.white)
            c.setFont("Helvetica-BoldOblique", 15)
            title_y = BANNER_Y0 + (banner_h - 10.8) / 2
            c.drawString(mid_start + 10, title_y, config.get("resource", ""))
            if charges_label:
                c.setFont("Helvetica-Bold", 8)
                label_x = mid_start + 138
                c.drawString(label_x, BANNER_Y0 + (banner_h - 5.8) / 2, charges_label)
            right = mid_end - 8
            charge_size = 8
            charge_y0 = BANNER_Y0 + (banner_h - charge_size) / 2
            for i in range(5, 0, -1):
                x0 = right - (5 - i) * 10 - 8
                circle_checkbox(c, "Charge %d" % i, x0, charge_y0, charge_size)
        return draw

    return None  # pure mana, no charges -> banner omitted, tracker lives on page 2


def draw_page1(c, config, page_w=BASE_PAGE_W, portrait_bytes=None):
    accent = config["accent"]
    name = config["name"]

    if config.get("background") == "checker":
        draw_checker_background(c, accent, page_w=page_w)
    else:
        c.setFillColor(colors.white)
        c.rect(0, 0, page_w, PAGE_H, stroke=0, fill=1)

    # title (auto-shrink so long class names never run into the banner),
    # centered in the space it has between the page edge and the mid column
    c.setFillColor(col(accent))
    title_size = 34
    title_x0, title_x1 = 14, mid_start - 8
    max_title_w = title_x1 - title_x0
    while title_size > 12 and stringWidth(name, "Helvetica-BoldOblique", title_size) > max_title_w:
        title_size -= 1
    title_cx = (title_x0 + title_x1) / 2
    c.setFont("Helvetica-BoldOblique", title_size)
    c.drawCentredString(title_cx, 578, name)
    c.setLineWidth(3)
    c.setStrokeColor(col(accent))
    c.line(title_x0, 574, title_x1, 574)

    banner = draw_resource_banner(config, accent)
    if banner:
        banner(c)
        mid_top = BANNER_Y0 - 13
    else:
        mid_top = LEVEL_TOP_NO_BANNER

    # =========================================================================
    # LEFT column: the whole stat block -- identity fields, HP, level row,
    # ability scores, and skills -- stacked top to bottom with a cursor so
    # nothing has to be hand-measured against its neighbors.
    # =========================================================================
    cursor = 558  # just below the title underline (574)

    # -- identity fields (label left, box right) -- box start is the actual
    # measured label width + padding, not a guessed fixed offset (that
    # guess was wrong for "Background", the widest one, and ran the box
    # right into the text). --
    id_labels = ("Name", "Ancestry", "Background", "Subclass", "Language")
    id_box_x0 = max(stringWidth(l, "Helvetica-Bold", 8) for l in id_labels) + left_start + 8
    for lbl, field in zip(id_labels, id_labels):
        row_h = 17
        c.setFont("Helvetica-Bold", 8)
        c.setFillColor(colors.black)
        c.drawString(left_start, cursor - row_h + 5.5, lbl)
        text_field(c, field, id_box_x0, cursor - row_h, left_end, cursor, size=8)
        cursor -= row_h + 6

    # -- coin / hit die (side by side, label width measured so it can never
    # collide with its own box) --
    half_w = (left_end - left_start - 6) / 2
    row_h = 16
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(colors.black)
    c.drawString(left_start, cursor - row_h / 2 - 3, "Coin")
    coin_label_w = stringWidth("Coin", "Helvetica-Bold", 8)
    text_field(c, "Currency", left_start + coin_label_w + 6, cursor - row_h,
               left_start + half_w, cursor, size=8, align="center")

    hd_x0 = left_start + half_w + 6
    c.setFont("Helvetica-Bold", 8)
    c.setFillColor(colors.black)
    c.drawString(hd_x0, cursor - row_h / 2 - 3, "Hit Die")
    hd_label_w = stringWidth("Hit Die", "Helvetica-Bold", 8)
    text_field(c, "Hit Die", hd_x0 + hd_label_w + 6, cursor - row_h, left_end, cursor, size=8,
               align="center")
    cursor -= row_h + 6

    # -- portrait (swapped in from the mid column; HP/level/stat cards moved
    # to the mid column below in their place) --
    PORTRAIT_LEFT_H = 190
    portrait_bottom = cursor - PORTRAIT_LEFT_H
    bx, by, bw, bh = left_start, portrait_bottom, left_end - left_start, PORTRAIT_LEFT_H
    pr = min(RADIUS + 2, bw / 2, bh / 2)
    rounded_box(c, bx, by, bw, bh, radius=pr)
    if portrait_bytes:
        try:
            img = ImageReader(io.BytesIO(portrait_bytes))
            iw, ih = img.getSize()
            scale = max(bw / iw, bh / ih)  # cover-fit: fill the box, cropping overflow
            dw, dh = iw * scale, ih * scale
            dx = bx + (bw - dw) / 2
            dy = by + (bh - dh) / 2
            c.saveState()
            p = c.beginPath()
            p.roundRect(bx, by, bw, bh, pr)
            c.clipPath(p, stroke=0, fill=0)
            c.drawImage(img, dx, dy, dw, dh, mask="auto")
            c.restoreState()
            c.setLineWidth(1)
            c.setStrokeColor(colors.black)
            c.roundRect(bx, by, bw, bh, pr, stroke=1, fill=0)
        except Exception:
            pass
    cursor = portrait_bottom - 20

    # -- skills: header, then rows sized to a comfortable fixed pitch (capped
    # so leftover room becomes bottom margin instead of stretching the rows
    # out too far, which was starving the sections above of their own space) --
    c.setFont("Helvetica-BoldOblique", 13)
    c.setFillColor(col(accent))
    c.drawString(left_start, cursor, "SKILLS")
    cursor -= 12

    skill_box_x0 = left_end - 36  # keep the box a fixed 36pt wide, clear of the longest skill name
    left_margin = 8  # bottom margin above y=0
    skill_pitch = min(23, (cursor - left_margin) / len(SKILLS))
    skill_box_h = min(18, skill_pitch - 4)
    box_top = cursor
    for skill, stat in SKILLS:
        c.setFont("Helvetica-Bold", 10)
        c.setFillColor(colors.black)
        c.drawString(left_start, box_top - skill_box_h / 2 - 3.5, skill)
        w = stringWidth(skill, "Helvetica-Bold", 10)
        c.setFont("Helvetica", 7.5)
        c.setFillColor(colors.Color(0.4, 0.4, 0.4))
        c.drawString(left_start + w + 5, box_top - skill_box_h / 2 - 3.5, stat)
        text_field(c, "Skill %s" % skill, skill_box_x0, box_top - skill_box_h, left_end,
                   box_top, size=11, align="center")
        box_top -= skill_pitch

    # =========================================================================
    # MID column: resource banner (drawn above), HP/level/stat cards (swapped
    # in from the left column), subclass & abilities, inventory, then wounds
    # pinned at the bottom.
    # =========================================================================
    WOUNDS_SECTION_H = 66   # room reserved at the bottom for the wounds track + its label (the
                            # "WOUNDS" text ascends above its y=51 baseline, so this needs real
                            # clearance above it or the Inventory box's bottom border cuts through it)
    ABIL_H = 145
    MID_GAP = 8  # breathing room between the stacked mid-column panels

    top = mid_top

    # -- HP row (wider boxes now that this has the full mid-column width) --
    # Armor rides along on the same line, in the leftover space past Temp HP.
    hp_now_x, hp_max_x = mid_start + 34, mid_start + 74
    hp_temp_x0, hp_temp_x1 = mid_start + 128, mid_start + 173
    armor_x0, armor_x1 = hp_temp_x1 + 13, mid_end
    for lbl, x0, x1 in (("NOW", hp_now_x, hp_now_x + 34), ("MAX", hp_max_x, hp_max_x + 34),
                        ("TEMP", hp_temp_x0, hp_temp_x1), ("ARMOR", armor_x0, armor_x1)):
        label_centered(c, (x0 + x1) / 2, top, lbl)
    top -= 5
    c.setFont("Helvetica-Bold", 15)
    c.setFillColor(colors.black)
    c.drawString(mid_start, top - 17, "HP")
    text_field(c, "HP - Current", hp_now_x, top - 24, hp_now_x + 34, top, size=11, align="center")
    text_field(c, "HP - Max", hp_max_x, top - 24, hp_max_x + 34, top, size=11, align="center")
    c.setFont("Helvetica-Bold", 13)
    c.drawString(hp_max_x + 39, top - 17, "+")
    text_field(c, "Temp HP", hp_temp_x0, top - 24, hp_temp_x1, top, size=11, align="center")
    text_field(c, "Armor", armor_x0, top - 24, armor_x1, top, size=11, align="center")
    top -= 24 + 12

    # -- level / speed / init row --
    third = (mid_end - mid_start - 6) / 3
    for i, (lbl, field) in enumerate((("LEVEL", "Level"), ("SPEED", "Speed"),
                                       ("INITIATIVE", "Initiative"))):
        x0 = mid_start + i * (third + 3)
        x1 = x0 + third
        label_centered(c, (x0 + x1) / 2, top, lbl)
        text_field(c, field, x0, top - 24, x1, top - 4, align="center")
    top -= 24 + 16

    # -- ability score cards: rounded card, white score field over a black
    # name bar -- bigger now that they have the full mid-column width --
    stat_label_h = 16
    stat_card_w = (mid_end - mid_start - 24) / 4  # 3 gaps of 8pt
    card_top, card_bottom = top, top - 44
    for i, s in enumerate(STATS):
        x0 = mid_start + i * (stat_card_w + 8)
        x1 = x0 + stat_card_w
        w = x1 - x0
        cx = x0 + (w - 9) / 2
        tri_checkbox(c, "%s Adv" % s, cx, card_top + 3, 9, up=True)

        r = min(RADIUS + 1, w / 2, (card_top - card_bottom) / 2)
        c.saveState()
        p = c.beginPath()
        p.roundRect(x0, card_bottom, w, card_top - card_bottom, r)
        c.clipPath(p, stroke=0, fill=0)
        c.setFillColor(colors.white)
        c.rect(x0, card_bottom, w, card_top - card_bottom, stroke=0, fill=1)
        c.setFillColor(colors.black)
        c.rect(x0, card_bottom, w, stat_label_h, stroke=0, fill=1)
        c.restoreState()
        c.setLineWidth(1)
        c.setStrokeColor(colors.black)
        c.roundRect(x0, card_bottom, w, card_top - card_bottom, r, stroke=1, fill=0)

        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString((x0 + x1) / 2, card_bottom + stat_label_h / 2 - 3.6, s)

        _mark_center(c, s)
        c.acroForm.textfield(
            name=s, x=x0, y=card_bottom + stat_label_h, width=w,
            height=card_top - card_bottom - stat_label_h,
            fontName="Helvetica-Bold", fontSize=18, value="",
            borderStyle="solid", borderWidth=0, borderColor=None,
            fillColor=None, textColor=colors.black, forceBorder=False,
        )
        tri_checkbox(c, "%s Dis" % s, cx, card_bottom - 12, 9, up=False)
    top = card_bottom - 12 - 5  # closer to inventory now, still clear of the Dis triangles

    # -- inventory (fixed-height slot, swapped up to where abilities used to be) --
    mid_label, mid_field = config.get("mid_panel", ("INVENTORY", "Inventory"))
    inv_bottom = top - ABIL_H
    # Same header-bar style as NOTES / SUBCLASS & ABILITIES, instead of the
    # small corner tag used elsewhere in the engine.
    header_card(c, mid_start, mid_end, inv_bottom, top, 15, mid_label, mid_field, size=9.5)
    top = inv_bottom - MID_GAP

    # -- subclass & abilities: fills whatever is left above the wounds section --
    wounds_section_top = WOUNDS_SECTION_H
    abil_top = top - 3
    header_card(c, mid_start, mid_end, wounds_section_top, abil_top, 15,
                "SUBCLASS & ABILITIES", "Abilities", size=9.5)

    # -- wounds: a pill-shaped track, circles beaded on a connecting line --
    # Shifted up by WY so its lowest element (the dashed row) lines up with
    # the y=11 bottom margin every other panel on the page uses, instead of
    # hanging lower than everything else.
    WY = 3
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(colors.black)
    c.drawString(mid_start, 51 + WY, "WOUNDS")
    box_y0, box_h = 20 + WY, 26
    rounded_box(c, mid_start, box_y0, mid_end - mid_start, box_h, radius=box_h / 2)

    line_y = 34 + WY
    c.setLineWidth(1)
    c.setStrokeColor(colors.black)
    wound_x0 = mid_start + 18
    c.line(wound_x0, line_y, wound_x0 + 186, line_y)

    for i in range(1, 6):
        x0 = wound_x0 - 6 + (i - 1) * 37.2
        circle_checkbox(c, "Wound %d" % i, x0, 28 + WY, 12)

    # decorative 6th (skull-and-crossbones) marker on the line -- not a field.
    # Built from plain circles/polygons (not hand-tuned bezier curves, which
    # kept coming out looking angular): a filled circle for the rounded head
    # mass, unioned with a pentagon-base trapezoid beneath it for the
    # tapering chin (a flat bottom edge, not a single point). Each bone end
    # gets a *pair* of knob circles (perpendicular to the shaft), the classic
    # "dog bone" double-lobe look, instead of one round ball.
    sx = wound_x0 - 6 + 5 * 37.2
    cx, cy = sx + 6, 34.5 + WY
    Rc = 4.6
    head_cy = cy + 0.5
    DX, DY = 6.8, 3.6  # flatter diagonal: closer to horizontal than vertical
    BONE_LW = 1.5
    KNOB_R = 1.1
    KNOB_OFFSET = 0.7

    c.setLineCap(1)  # round caps -> the shaft itself reads as a thick capsule
    c.setLineWidth(BONE_LW)
    c.setStrokeColor(colors.black)
    for ax, ay, bx2, by2 in (
        (cx - DX, cy - DY, cx + DX, cy + DY),
        (cx - DX, cy + DY, cx + DX, cy - DY),
    ):
        c.line(ax, ay, bx2, by2)
        dx, dy = bx2 - ax, by2 - ay
        length = math.hypot(dx, dy)
        px, py = -dy / length * KNOB_OFFSET, dx / length * KNOB_OFFSET
        c.setFillColor(colors.black)
        for x0, y0 in ((ax, ay), (bx2, by2)):
            c.circle(x0 + px, y0 + py, KNOB_R, stroke=0, fill=1)
            c.circle(x0 - px, y0 - py, KNOB_R, stroke=0, fill=1)

    c.setFillColor(colors.black)
    c.circle(cx, head_cy, Rc, stroke=0, fill=1)
    p = c.beginPath()
    p.moveTo(cx - Rc * 0.85, head_cy - Rc * 0.1)
    p.lineTo(cx + Rc * 0.85, head_cy - Rc * 0.1)
    p.lineTo(cx + Rc * 0.5, head_cy - Rc * 1.3)
    p.lineTo(cx - Rc * 0.5, head_cy - Rc * 1.3)
    p.close()
    c.drawPath(p, stroke=0, fill=1)

    c.setFillColor(colors.white)
    c.circle(cx - Rc * 0.42, head_cy + Rc * 0.12, Rc * 0.3, stroke=0, fill=1)
    c.circle(cx + Rc * 0.42, head_cy + Rc * 0.12, Rc * 0.3, stroke=0, fill=1)

    for i in range(1, 6):
        x0 = wound_x0 - 4.5 + (i - 1) * 37.2
        circle_checkbox(c, "Wound +%d" % i, x0, 8.5 + WY, 9, dashed=True)

    # =========================================================================
    # NOTE0 / NOTE1: two plain full-height notes boxes
    # =========================================================================
    joined_two_field_card(c, note0_start, note1_end, 11, 601, 20,
                          "NOTES", "Notes 0", "Notes 1")

    # =========================================================================
    # NEWBIE: optional new-player help column, only drawn (and only takes
    # page space) when CONFIG["newbie_help"] is truthy. This is fixed,
    # permanently-printed reference text (from the Core Rules, p.13,
    # "Heroic Actions") -- not an editable field, like the reference-page
    # columns elsewhere in the engine.
    # =========================================================================
    if config.get("newbie_help"):
        draw_newbie_column(c, newbie_start, newbie_end, accent,
                            config.get("newbie_help_sections", NEWBIE_HELP_SECTIONS))


# --------------------------------------------------------------------------
# page 2: spellbook
# --------------------------------------------------------------------------
SPELL_COLS_TOP = ["CANTRIPS", "TIER 1", "TIER 2", "TIER 3", "TIER 4"]
SPELL_COLS_BOTTOM = ["TIER 5", "TIER 6", "TIER 7", "TIER 8", "TIER 9"]
SPELL_FIELDS_TOP = ["Book Cantrips", "Book T1", "Book T2", "Book T3", "Book T4"]
SPELL_FIELDS_BOTTOM = ["Book T5", "Book T6", "Book T7", "Book T8", "Book T9"]
# sized so the Utility Spells sidebar lines up as an equal-width 6th column
# alongside the 5-wide Cantrips/Tier grid
SPELL_SIDEBAR_W = ((BASE_PAGE_W - 22) - 5 * 12) / 6


def draw_five_col_grid(c, accent, titles, fields, top_y, bottom_y, x0=11):
    n = len(titles)
    col_w = ((BASE_PAGE_W - 11) - x0 - (n - 1) * 12) / n
    x = x0
    for i in range(n):
        header_card(c, x, x + col_w, bottom_y, top_y, 20, titles[i], fields[i],
                    size=10, header_fill=col(accent))
        x += col_w + 12


PAGE2_BANNER_Y0, PAGE2_BANNER_Y1 = 582, 607
PAGE2_GRID_TOP = 575
PAGE2_BANNER_X0, PAGE2_BANNER_X1 = 11, BASE_PAGE_W - 11   # banner's own left/right edges
PAGE2_MANA_BLOCK_W = 96                                   # Now-box + gap + Max-box, see draw_mana_tracker calls below
PAGE2_MANA_X0 = PAGE2_BANNER_X1 - PAGE2_MANA_BLOCK_W - 12  # 12pt in from the banner's right edge


def draw_page2_banner(c, accent, title, has_mana=False):
    """The title + mana readout strip shared by the spellbook and printed-reference pages: title flush left, mana readout flush right."""
    h = PAGE2_BANNER_Y1 - PAGE2_BANNER_Y0
    rounded_box(c, PAGE2_BANNER_X0, PAGE2_BANNER_Y0, PAGE2_BANNER_X1 - PAGE2_BANNER_X0, h,
                radius=RADIUS + 2, fill=col(accent), stroke=None)
    c.setFillColor(colors.white)
    title_right = PAGE2_MANA_X0 if has_mana else BASE_PAGE_W - 20
    title_size = 15
    while title_size > 9 and stringWidth(title, "Helvetica-BoldOblique", title_size) > title_right - 20:
        title_size -= 1
    c.setFont("Helvetica-BoldOblique", title_size)
    baseline = PAGE2_BANNER_Y0 + h / 2 - 5.5
    c.drawString(20, baseline, title)


def draw_mana_tracker(c, now_rect, max_rect, pool_label):
    """Just the NOW/MAX pool readout. The max is often adjusted by subclass/feat choices as a character levels."""
    nx0, ny0, nx1, ny1 = now_rect
    mx0, my0, mx1, my1 = max_rect
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(colors.white)
    c.drawRightString(nx0 - 8, ny0 + (ny1 - ny0) / 2 - 4, pool_label)
    text_field(c, "Mana Now", nx0, ny0, nx1, ny1, size=10, align="center")
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(colors.white)
    c.drawCentredString((nx1 + mx0) / 2, ny0 + (ny1 - ny0) / 2 - 4, "/")
    text_field(c, "Mana Max", mx0, my0, mx1, my1, size=10, align="center")


def draw_spell_page(c, config):
    accent = config["accent"]
    if config.get("background") == "checker":
        draw_checker_background(c, accent)
    else:
        c.setFillColor(colors.white)
        c.rect(0, 0, BASE_PAGE_W, PAGE_H, stroke=0, fill=1)

    draw_page2_banner(c, accent, "%s  SPELLBOOK" % config["name"], has_mana=True)

    draw_mana_tracker(
        c, (PAGE2_MANA_X0, PAGE2_BANNER_Y0 + 5, PAGE2_MANA_X0 + 40, PAGE2_BANNER_Y0 + 20),
        (PAGE2_MANA_X0 + 56, PAGE2_BANNER_Y0 + 5, PAGE2_MANA_X0 + 96, PAGE2_BANNER_Y0 + 20),
        config.get("pool_label", "MANA"),
    )

    # a 6th column on the left, stacked to match the two grid rows: the top
    # cell is titled for Utility Spells, the bottom cell is left untitled --
    # blank space for whatever else the player wants to track here.
    util_x0, util_x1 = 11, 11 + SPELL_SIDEBAR_W
    header_card(c, util_x0, util_x1, 288, PAGE2_GRID_TOP, 20, "UTILITY SPELLS",
                "Utility Spells", size=10, header_fill=col(accent))
    header_card(c, util_x0, util_x1, 11, 270, 0, "", "Spell Notes",
                header_fill=col(accent))

    grid_x0 = util_x1 + 12
    draw_five_col_grid(c, accent, SPELL_COLS_TOP, SPELL_FIELDS_TOP, PAGE2_GRID_TOP, 288, x0=grid_x0)
    draw_five_col_grid(c, accent, SPELL_COLS_BOTTOM, SPELL_FIELDS_BOTTOM, 270, 11, x0=grid_x0)


# --------------------------------------------------------------------------
# extra page: printed reference (Domain/Blessings/Totems, Menu/Quirks, ...)
# --------------------------------------------------------------------------
def draw_reference_page(c, config):
    accent = config["accent"]
    ref = config["reference_page"]
    if config.get("background") == "checker":
        draw_checker_background(c, accent)
    else:
        c.setFillColor(colors.white)
        c.rect(0, 0, BASE_PAGE_W, PAGE_H, stroke=0, fill=1)

    has_mana = config.get("resource_mode") == "mana" and not config.get("spell_page")
    draw_page2_banner(c, accent, ref.get("banner", ""), has_mana=has_mana)

    if has_mana:
        draw_mana_tracker(
            c, (PAGE2_MANA_X0, PAGE2_BANNER_Y0 + 2, PAGE2_MANA_X0 + 40, PAGE2_BANNER_Y0 + 15),
            (PAGE2_MANA_X0 + 56, PAGE2_BANNER_Y0 + 2, PAGE2_MANA_X0 + 96, PAGE2_BANNER_Y0 + 15),
            config.get("pool_label", "MANA"),
        )

    columns = ref.get("columns", [])
    n = len(columns)
    footer = ref.get("footer", "")
    footer_h = 0
    if footer:
        footer_lines = wrap_text(footer, "Helvetica-Oblique", 8, BASE_PAGE_W - 22)
        footer_h = len(footer_lines) * 10 + 6

    top_y = PAGE2_GRID_TOP
    bottom_y = 11 + footer_h
    gap = 16
    col_w = (BASE_PAGE_W - 22 - (n - 1) * gap) / n
    x = 11
    for colinfo in columns:
        # Just a titled card with a blank ruled field for the whole body --
        # no rules text baked in, printed, or pre-filled; it's the player's
        # space to fill in under the column heading.
        header_card(c, x, x + col_w, bottom_y, top_y, 22,
                    colinfo["title"], colinfo["field"], header_fill=col(accent))
        x += col_w + gap

    if footer:
        c.setFont("Helvetica-Oblique", 8)
        c.setFillColor(colors.Color(0.35, 0.35, 0.35))
        fy = bottom_y - 12
        for line in wrap_text(footer, "Helvetica-Oblique", 8, BASE_PAGE_W - 22):
            c.drawString(11, fy, line)
            fy -= 10


# --------------------------------------------------------------------------
# entry points
# --------------------------------------------------------------------------
def build(config, out_path, portrait_bytes=None):
    title = "Nimble %s Character Sheet" % config["name"].title()
    page_w = WIDE_PAGE_W if config.get("newbie_help") else BASE_PAGE_W

    c = canvas.Canvas(out_path, pagesize=(page_w, PAGE_H))
    c.setTitle(title)
    c.setAuthor("anonymous")
    c.setCreator("anonymous")
    c.setSubject("unspecified")

    draw_page1(c, config, page_w=page_w, portrait_bytes=portrait_bytes)
    c.showPage()

    # page 2+ are always base-width -- the newbie column is a page-1-only sidebar
    if page_w != BASE_PAGE_W and (config.get("spell_page") or config.get("reference_page")):
        c.setPageSize((BASE_PAGE_W, PAGE_H))

    if config.get("spell_page"):
        draw_spell_page(c, config)
        c.showPage()

    if config.get("reference_page"):
        draw_reference_page(c, config)
        c.showPage()

    c.save()
    _post_process(out_path, getattr(c, "_center_fields", ()))
    return out_path


def _post_process(path, center_fields):
    """Give the Adv/Dis checkboxes a real 'checked' appearance: a solid
    triangle filling the widget, matching the triangle already hand-drawn
    under it -- instead of reportlab's default checkmark-glyph ink, which
    reads as a generic tick sitting inside a triangle-shaped outline. Also
    center-aligns the small single-value boxes (reportlab's textfield() has
    no alignment param, so the /Q entry is set here instead)."""
    pdf = pikepdf.open(path, allow_overwriting_input=True)
    for page in pdf.pages:
        annots = page.get("/Annots")
        if not annots:
            continue
        for annot in annots:
            name = str(annot.get("/T", ""))
            if name in center_fields:
                annot["/Q"] = 1
            if annot.get("/FT") != pikepdf.Name("/Btn"):
                continue
            if not (name.endswith(" Adv") or name.endswith(" Dis")):
                continue
            rect = annot["/Rect"]
            w = float(rect[2]) - float(rect[0])
            h = float(rect[3]) - float(rect[1])
            if name.endswith(" Adv"):
                tri = "0 0 m %.2f 0 l %.2f %.2f l h f" % (w, w / 2, h)
            else:
                tri = "0 %.2f m %.2f %.2f l %.2f 0 l h f" % (h, w, h, w / 2)
            stream = pikepdf.Stream(pdf, ("0 g\n" + tri).encode("latin1"))
            stream["/Type"] = pikepdf.Name("/XObject")
            stream["/Subtype"] = pikepdf.Name("/Form")
            stream["/BBox"] = [0, 0, w, h]
            stream["/Resources"] = pikepdf.Dictionary({})
            if "/AP" not in annot:
                annot["/AP"] = pikepdf.Dictionary({})
            if "/N" not in annot["/AP"]:
                annot["/AP"]["/N"] = pikepdf.Dictionary({})
            annot["/AP"]["/N"]["/Yes"] = stream

    # Tell every viewer to regenerate field appearances itself instead of
    # trusting only the (blank) ones reportlab baked in at build time -- some
    # PDF readers otherwise show fields as filled-in-but-uneditable, or don't
    # visually update typed text, without this flag.
    pdf.Root.AcroForm.NeedAppearances = True

    pdf.save(path)
    pdf.close()


def verify(path):
    """Sanity-check a generated sheet and print a short report."""
    try:
        from pypdf import PdfReader
    except ImportError:
        print("! pypdf not installed -- skipping verification of %s" % path)
        return

    r = PdfReader(path)
    fields = r.get_fields() or {}
    n_pages = len(r.pages)

    problems = []
    for page_num, page in enumerate(r.pages):
        mb = page.mediabox
        for annot in page.get("/Annots", []) or []:
            obj = annot.get_object()
            rect = obj.get("/Rect")
            if not rect:
                continue
            x0, y0, x1, y1 = (float(v) for v in rect)
            if x0 < 0 or y0 < 0 or x1 > float(mb.width) or y1 > float(mb.height):
                problems.append("page %d field %r out of bounds" % (page_num + 1, obj.get("/T")))

    print("- %s: %d page(s), %d form field(s)" % (path, n_pages, len(fields)))
    if problems:
        print("  ! %d issue(s):" % len(problems))
        for p in problems[:10]:
            print("    -", p)
    else:
        print("  OK")
