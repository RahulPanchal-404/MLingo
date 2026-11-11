"""Pure progression rules: XP, levels, streaks and badges.

Everything here is derived from the stored game results, so there is no
mutable counter that can drift out of sync with the history.
"""

from __future__ import annotations

import math
from dataclasses import dataclass
from datetime import date, timedelta

from app.players.store import ResultRecord

GAME_LEVELS: dict[str, list[str]] = {
    "golf": ["bowl", "valley", "plateau", "bunker", "saddle", "canyon"],
    "rewind": ["overshoot", "warmup", "outlier", "crawl"],
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


BADGES: list[Badge] = [
    Badge("first-steps", "First steps", "Finish your first game."),
    Badge("on-fire", "On fire", "Keep a 3-day streak."),
    Badge("unstoppable", "Unstoppable", "Keep a 7-day streak."),
    Badge("hole-in-one", "Hole in one", "Sink a Gradient Golf hole in a single shot."),
    Badge("course-champion", "Course champion", "Get 3 stars on every golf hole."),
    Badge("time-lord", "Time lord", "Save a run in Rewind using only one rewind."),
    Badge("last-second", "Last second save", "Rewind in the final quarter of a run and still save it."),
    Badge("rewind-master", "Rewind master", "Get 3 stars on every Rewind scenario."),
    Badge("level-5", "Rising star", "Reach player level 5."),
]


def best_stars(results: list[ResultRecord]) -> dict[str, dict[str, dict[str, int]]]:
    best: dict[str, dict[str, dict[str, int]]] = {game: {} for game in GAME_LEVELS}
    for r in results:
        entry = best.setdefault(r.game, {}).setdefault(r.level_id, {"stars": 0, "best_score": 0, "plays": 0})
        entry["stars"] = max(entry["stars"], r.stars)
        entry["best_score"] = max(entry["best_score"], r.score)
        entry["plays"] += 1
    return best


def earned_badges(results: list[ResultRecord], best_streak: int, level: int) -> set[str]:
    earned: set[str] = set()
    if results:
        earned.add("first-steps")
    if best_streak >= 3:
        earned.add("on-fire")
    if best_streak >= 7:
        earned.add("unstoppable")
    if level >= 5:
        earned.add("level-5")
    best = best_stars(results)
    for r in results:
        if r.game == "golf" and r.stars > 0 and r.meta.get("strokes") == 1:
            earned.add("hole-in-one")
        if r.game == "rewind" and r.stars > 0:
            if r.meta.get("rewinds_used") == 1:
                earned.add("time-lord")
            if float(r.meta.get("rewind_fraction", 0)) >= 0.75:
                earned.add("last-second")
    for game, badge in (("golf", "course-champion"), ("rewind", "rewind-master")):
        if all(best.get(game, {}).get(lvl, {}).get("stars", 0) == 3 for lvl in GAME_LEVELS[game]):
            earned.add(badge)
    return earned
