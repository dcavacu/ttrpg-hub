# -*- coding: utf-8 -*-
"""The 9 Nimble class configs the character-sheet generator offers, ported from
the standalone class_*.py scripts. Each dict is exactly what sheet_engine.build()
expects; the web endpoint overrides "accent" with the user's chosen color and
passes an uploaded portrait separately, so those two fields are the only ones
that ever differ from the source scripts at request time.
"""

CLASS_CONFIGS = {
    "berserker": {
        "name": "BERSERKER",
        "accent": (0.83, 0.09, 0.11),
        "resource": "FURY DICE",
        "resource_mode": "dice",
        "mid_panel": ("INVENTORY", "Inventory"),
        "background": "checker",
        "newbie_help": False,
    },
    "cheat": {
        "name": "CHEAT",
        "accent": (0.68, 0.50, 0.07),
        "resource": "SNEAK ATTACK",
        "resource_mode": "dice",
        "dice_slots": 3,
        "mid_panel": ("INVENTORY", "Inventory"),
        "background": "checker",
    },
    "homebrewer": {
        "name": "HOMEBREWER",
        "accent": (0.42, 0.18, 0.60),
        "resource": "MENU POTIONS",
        "resource_mode": "mana",
        "pool_label": "MP",
        "mid_panel": ("INVENTORY", "Inventory"),
        "background": "checker",
        "reference_page": {
            "banner": "THE MENU   &   QUIRKS",
            "columns": [
                {"title": "MENU POTIONS", "field": "Menu Potions List"},
                {"title": "QUIRKS", "field": "Quirks List"},
            ],
        },
    },
    "mage": {
        "name": "MAGE",
        "accent": (0.482, 0.0, 0.173),
        "resource": "ELEMENTAL MAGIC",
        "resource_mode": "mana",
        "mid_panel": ("INVENTORY", "Inventory"),
        "spell_page": True,
        "background": "checker",
    },
    "oathsworn": {
        "name": "OATHSWORN",
        "accent": (0.10, 0.10, 0.90),
        "resource": "JUDGMENT DICE",
        "resource_mode": "dice",
        "dice_slots": 3,
        "mid_panel": ("INVENTORY", "Inventory"),
        "spell_page": True,
        "background": "checker",
        "reference_page": {
            "banner": "SACRED DECREES   ·   LAY ON HANDS",
            "columns": [
                {"title": "SACRED DECREES", "field": "Sacred Decrees List"},
                {"title": "LAY ON HANDS", "field": "Lay on Hands Notes"},
            ],
        },
    },
    "shaman": {
        "name": "SHAMAN",
        "accent": (0.09, 0.49, 0.51),
        "resource": "SPIRITUAL MAGIC",
        "resource_mode": "mana",
        "mid_panel": ("INVENTORY", "Inventory"),
        "spell_page": True,
        "background": "checker",
        "reference_page": {
            "banner": "DOMAIN   ·   BLESSINGS   ·   TOTEMS",
            "columns": [
                {"title": "THE DOMAIN", "field": "Domain Notes"},
                {"title": "BLESSINGS", "field": "Blessings List"},
                {"title": "TOTEMS", "field": "Totem Choice"},
            ],
        },
    },
    "shepherd": {
        "name": "SHEPHERD",
        "accent": (0.482, 0.0, 0.173),
        "resource": "SEARING LIGHT",
        "resource_mode": "mana",
        "charges_label": "",
        "mid_panel": ("INVENTORY", "Inventory"),
        "spell_page": True,
        "background": "checker",
        "newbie_help": False,
        "reference_page": {
            "banner": "SACRED GRACES",
            "columns": [
                {"title": "SACRED GRACES", "field": "Sacred Graces List"},
            ],
        },
    },
    "stormshifter": {
        "name": "STORMSHIFTER",
        "accent": (0.0, 0.502, 0.3),
        "resource": "BEASTSHIFT",
        "resource_mode": "mana",
        "charges_label": "SHIFTS",
        "mid_panel": ("INVENTORY", "Inventory"),
        "spell_page": True,
        "background": "checker",
    },
    "virtuoso": {
        "name": "VIRTUOSO",
        "resource_mode": "none",
        "accent": (0.75, 0.12, 0.48),
        "mid_panel": ("INVENTORY", "Inventory"),
        "background": "checker",
        "reference_page": {
            "banner": "COMBAT ACTS   ·   NARRATIVE HOOKS",
            "columns": [
                {"title": "COMBAT ACTS", "field": "Combat Acts List"},
                {"title": "NARRATIVE HOOKS", "field": "Narrative Hooks List"},
            ],
        },
    },
    "artificer": {
        "name": "ARTIFICER",
        "accent": (0.25, 0.35, 0.45),
        "resource": "MANA DICE",
        "resource_mode": "dice",
        "dice_slots": 4,
        "mid_panel": ("INVENTORY", "Inventory"),
        "background": "checker",
        "reference_page": {
            "banner": "INVENTIONS   &   GADGETS",
            "columns": [
                {"title": "INVENTIONS", "field": "Inventions List"},
                {"title": "GADGETS", "field": "Gadgets List"},
            ],
        },
    },
    "hexbinder": {
        "name": "HEXBINDER",
        "accent": (0.35, 0.12, 0.28),
        "resource": "HEX MAGIC",
        "resource_mode": "mana",
        "mid_panel": ("INVENTORY", "Inventory"),
        "spell_page": True,
        "background": "checker",
        "reference_page": {
            "banner": "AFFLICTIONS   &   MYSTIC MARKS",
            "columns": [
                {"title": "AFFLICTIONS", "field": "Afflictions List"},
                {"title": "MYSTIC MARKS", "field": "Mystic Marks List"},
            ],
        },
    },
    "commander": {
        "name": "COMMANDER",
        "accent": (0.88, 0.32, 0.02),
        "resource": "COMBAT DICE",
        "resource_mode": "dice",
        "dice_slots": 5,
        "mid_panel": ("INVENTORY", "Inventory"),
        "background": "checker",
        "reference_page": {
            "banner": "COMMANDER'S ORDERS   ·   COMBAT TACTICS",
            "columns": [
                {"title": "COMMANDER'S ORDERS", "field": "Commander's Orders List"},
                {"title": "COMBAT TACTICS", "field": "Combat Tactics List"},
            ],
        },
    },
    "hunter": {
        "name": "HUNTER",
        "accent": (0.33, 0.42, 0.15),
        "resource": "THE THRILL",
        "resource_mode": "mana",
        "charges_label": "CHARGES",
        "pool_label": "CHARGES",
        "mid_panel": ("INVENTORY", "Inventory"),
        "background": "checker",
        "reference_page": {
            "banner": "THRILL OF THE HUNT",
            "columns": [
                {"title": "THRILL OF THE HUNT", "field": "Thrill of the Hunt List"},
            ],
        },
    },
    "shadowmancer": {
        "name": "SHADOWMANCER",
        "accent": (0.16, 0.04, 0.24),
        "resource": "SHADOW PACT",
        "resource_mode": "mana",
        "charges_label": "PILFERS",
        "mid_panel": ("INVENTORY", "Inventory"),
        "spell_page": True,
        "background": "checker",
        "reference_page": {
            "banner": "LESSER   &   GREATER INVOCATIONS",
            "columns": [
                {"title": "LESSER INVOCATIONS", "field": "Lesser Invocations List"},
                {"title": "GREATER INVOCATIONS", "field": "Greater Invocations List"},
            ],
        },
    },
    "songweaver": {
        "name": "SONGWEAVER",
        "accent": (0.05, 0.60, 0.75),
        "resource": "INSPIRATION",
        "resource_mode": "mana",
        "charges_label": "CHARGES",
        "mid_panel": ("INVENTORY", "Inventory"),
        "spell_page": True,
        "background": "checker",
        "reference_page": {
            "banner": "LYRICAL WEAPONRY   ·   A “PEOPLE” PERSON",
            "columns": [
                {"title": "LYRICAL WEAPONRY", "field": "Lyrical Weaponry List"},
                {"title": "A “PEOPLE” PERSON", "field": "Friends List"},
            ],
        },
    },
    "zephyr": {
        "name": "ZEPHYR",
        "accent": (0.30, 0.50, 0.65),
        "resource": "SWIFT BURSTS",
        "resource_mode": "mana",
        "charges_label": "SPEED",
        "pool_label": "SPEED",
        "mid_panel": ("INVENTORY", "Inventory"),
        "background": "checker",
        "reference_page": {
            "banner": "MARTIAL ARTS",
            "columns": [
                {"title": "MARTIAL ARTS", "field": "Martial Arts List"},
            ],
        },
    },
    "conduit": {
        "name": "CONDUIT",
        "accent": (0.20, 0.05, 0.55),
        "resource": "ARCANE WARD",
        "resource_mode": "mana",
        "pool_label": "HP",
        "mid_panel": ("INVENTORY", "Inventory"),
        "spell_page": True,
        "background": "checker",
        "reference_page": {
            "banner": "LAWS   ·   TRUTHS",
            "columns": [
                {"title": "LAWS", "field": "Laws List"},
                {"title": "TRUTHS", "field": "Truths List"},
            ],
        },
    },
}
