"""Add dark-mode variants to light-only Tailwind colour classes in the given files.

For each class list (a className string), and for each of background, border and text,
if the list has a light colour but no dark: variant for that property, the matching
dark variant is appended. Arbitrary pastel colours (bg-[#...]) are left to globals.css.

Usage: python3 scripts/darkify.py path/to/file.tsx [...]
"""

import re
import sys

HUES = "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose"


def dark_for(cls: str) -> str | None:
    m = re.fullmatch(r"(hover:)?bg-white(/(\d+))?", cls)
    if m:
        # translucent white (/10, /20 …) is an overlay meant for dark backgrounds already
        if m.group(3) and int(m.group(3)) <= 40:
            return None
        return f"dark:{m.group(1) or ''}bg-slate-900"
    m = re.fullmatch(rf"(hover:)?bg-({HUES})-(50|100|200)(/\d+)?", cls)
    if m:
        pre, hue = m.group(1) or "", m.group(2)
        return f"dark:{pre}bg-slate-800/60" if hue in ("slate", "gray", "zinc", "neutral", "stone") else f"dark:{pre}bg-{hue}-500/10"
    m = re.fullmatch(rf"border-({HUES})-(50|100|200|300)(/\d+)?", cls)
    if m:
        hue = m.group(1)
        return "dark:border-slate-700" if hue in ("slate", "gray", "zinc", "neutral", "stone") else f"dark:border-{hue}-500/40"
    m = re.fullmatch(rf"(hover:)?text-({HUES})-(600|700|800|900|950)", cls)
    if m:
        pre, hue, shade = m.group(1) or "", m.group(2), int(m.group(3))
        if hue in ("slate", "gray", "zinc", "neutral", "stone"):
            return f"dark:{pre}text-slate-{'100' if shade >= 800 else '300'}" if shade >= 700 else None
        return f"dark:{pre}text-{hue}-300"
    if cls == "text-black":
        return "dark:text-white"
    return None


def prop(cls: str) -> str:
    base = cls.split(":")[-1]
    hover = "hover:" if cls.startswith("hover:") else ""
    for p in ("bg-", "border-", "text-"):
        if base.startswith(p):
            return hover + p
    return ""


def fix_list(s: str) -> str:
    classes = s.split()
    have_dark = {prop(c.split("dark:", 1)[1]) for c in classes if c.startswith("dark:")}
    # Pastel chips and chapter circles (thick black border, dark text on a pastel fill) keep their text colour.
    if "border-slate-950" in classes or "border-2" in classes and any(c.startswith("bg-[#") for c in classes):
        have_dark.add("text-")
    # Text on a saturated fill (buttons, badges) was chosen for that fill; leave it.
    if any(re.fullmatch(rf"bg-({HUES})-([3-9]00)", c) for c in classes):
        have_dark.add("text-")
    added = []
    for c in classes:
        d = dark_for(c)
        if d and prop(c) not in have_dark and d not in classes and d not in added:
            added.append(d)
            have_dark.add(prop(c))
    return " ".join(classes + added)


def run(path: str) -> int:
    src = open(path, encoding="utf-8").read()
    count = 0

    def repl(m: re.Match) -> str:
        nonlocal count
        new = fix_list(m.group(2))
        if new != m.group(2):
            count += 1
        return f'{m.group(1)}{new}{m.group(3)}'

    # className="..." and quoted strings inside className={`...`} / ternaries
    out = re.sub(r'(className=")([^"]*)(")', repl, src)
    out = re.sub(r'((?<=[?:(,\s])")([^"\n]*\b(?:bg|text|border)-[^"\n]*)(")', repl, out)
    open(path, "w", encoding="utf-8").write(out)
    return count


if __name__ == "__main__":
    for p in sys.argv[1:]:
        print(p, run(p))
