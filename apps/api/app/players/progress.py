"""Pure progression rules: XP, levels, streaks and badges.

Everything here is derived from the stored game results, so there is no
mutable counter that can drift out of sync with the history.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date, timedelta

from app.players.store import ResultRecord

# Keep in sync with the level IDs in apps/web/features/games/*/engine.ts.
GAME_LEVELS: dict[str, list[str]] = {
    "descent": ["eyeball", "step-size", "ravine", "trap"],
    "threshold": ["sigmoid", "balanced", "screening", "fraud"],
    "clusters": ["elbow", "start", "units", "rings"],
    "neurons": ["xor", "capacity", "saturate", "lr"],
    "pipeline": ["leak", "overfit", "order", "metric"],
}

DAILY_XP_GOAL = 60
MAX_SCORE = 10_000


def xp_for_result(stars: int, already_cleared_with: int) -> int:
    """Base XP for playing, more for stars, bonus for beating your previous best."""
    xp = 10 + 15 * stars
    if stars > already_cleared_with:
        xp += 20 * (stars - already_cleared_with)
    return xp


def level_for_xp(xp: int) -> tuple[int, int, int]:
    """Return (level, xp into level, xp needed for next level). Each level costs 100 more than the last."""
    level = int((-1 + math.sqrt(1 + 8 * xp / 100)) / 2) + 1
    floor_xp = 100 * (level - 1) * level // 2
    span = 100 * level
    return level, xp - floor_xp, span


def streaks(active_days: set[date], today: date) -> tuple[int, int]:
    """Current streak counts back from today (or yesterday, so it survives until midnight)."""
    if not active_days:
        return 0, 0
    best = run = 0
    previous: date | None = None
    for day in sorted(active_days):
        run = run + 1 if previous is not None and day - previous == timedelta(days=1) else 1
        best = max(best, run)
        previous = day
    cursor = today if today in active_days else today - timedelta(days=1)
    current = 0
    while cursor in active_days:
        current += 1
        cursor -= timedelta(days=1)
    return current, best


@dataclass(frozen=True)
class Badge:
    id: str
    title: str
    description: str


GAME_TITLES = {
    "descent": ("Gradient guru", "Descent"),
    "threshold": ("Threshold tuner", "Threshold"),
    "clusters": ("Cluster commander", "Cluster Wars"),
    "neurons": ("Neuron surgeon", "Neuron Surgeon"),
    "pipeline": ("Pipeline detective", "Pipeline Detective"),
}

# Mirrored in apps/web/features/games/registry.ts (BADGES) for guests.
BADGES: list[Badge] = [
    Badge("first-steps", "First steps", "Pass your first level."),
    Badge("first-try", "First try", "Pass a level on your first run."),
    Badge("on-fire", "On fire", "Keep a 3-day streak."),
    Badge("unstoppable", "Unstoppable", "Keep a 7-day streak."),
    Badge("explorer", "Explorer", "Pass a level in every game."),
    *[Badge(f"{game}-master", title, f"3 stars on every {name} level.") for game, (title, name) in GAME_TITLES.items()],
    Badge("level-5", "Rising star", "Reach player level 5."),
]


def best_stars(results: list[ResultRecord]) -> dict[str, dict[str, dict[str, int]]]:
    best: dict[str, dict[str, dict[str, int]]] = {game: {} for game in GAME_LEVELS}
    for r in results:
        if r.game not in GAME_LEVELS:  # results from retired games stay in history but don't count
            continue
        entry = best.setdefault(r.game, {}).setdefault(r.level_id, {"stars": 0, "best_score": 0, "plays": 0})
        entry["stars"] = max(entry["stars"], r.stars)
        entry["best_score"] = max(entry["best_score"], r.score)
        entry["plays"] += 1
    return best


def earned_badges(results: list[ResultRecord], best_streak: int, level: int) -> set[str]:
    earned: set[str] = set()
    if any(r.stars > 0 for r in results):
        earned.add("first-steps")
    if best_streak >= 3:
        earned.add("on-fire")
    if best_streak >= 7:
        earned.add("unstoppable")
    if level >= 5:
        earned.add("level-5")
    best = best_stars(results)
    if any(r.game in GAME_LEVELS and r.stars > 0 and r.meta.get("attempts") == 1 for r in results):
        earned.add("first-try")
    if all(any(lvl.get("stars", 0) > 0 for lvl in best.get(game, {}).values()) for game in GAME_LEVELS):
        earned.add("explorer")
    for game, levels in GAME_LEVELS.items():
        if all(best.get(game, {}).get(lvl, {}).get("stars", 0) == 3 for lvl in levels):
            earned.add(f"{game}-master")
    return earned
