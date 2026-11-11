"""Account and progression services. Routes stay thin; the rules live here."""

from __future__ import annotations

import hashlib
import hmac
import secrets
from datetime import date, datetime, timedelta, timezone
from functools import lru_cache
from typing import TYPE_CHECKING

from app.core.config import get_settings
from app.players.progress import (
    BADGES,
    DAILY_XP_GOAL,
    GAME_LEVELS,
    MAX_SCORE,
    best_stars,
    earned_badges,
    level_for_xp,
    streaks,
    xp_for_result,
)
from app.players.store import PlayerRecord, PlayerStore

if TYPE_CHECKING:
    from app.players.pg_store import PostgresPlayerStore
from app.schemas.players import (
    BadgeOut,
    GameResultIn,
    PlayerOut,
    ProgressOut,
    RecordResultOut,
    RecentResultOut,
)

PBKDF2_ITERATIONS = 240_000


class PlayerError(Exception):
    def __init__(self, message: str, status_code: int) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


@lru_cache
def _sqlite_store(path: str) -> PlayerStore:
    return PlayerStore(path)


@lru_cache
def _postgres_store(url: str) -> "PostgresPlayerStore":
    from app.players.pg_store import PostgresPlayerStore  # optional dependency for local dev

    return PostgresPlayerStore(url)


def get_player_store() -> "PlayerStore | PostgresPlayerStore":
    settings = get_settings()
    if settings.players_database_url:
        return _postgres_store(settings.players_database_url)
    return _sqlite_store(settings.players_db_path)


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), PBKDF2_ITERATIONS).hex()
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt}${digest}"


def verify_password(password: str, stored: str) -> bool:
    try:
        _, iterations, salt, digest = stored.split("$")
    except ValueError:
        return False
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode(), bytes.fromhex(salt), int(iterations)).hex()
    return hmac.compare_digest(candidate, digest)


def _token_hash(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def _to_player_out(player: PlayerRecord) -> PlayerOut:
    return PlayerOut(id=player.id, email=player.email, display_name=player.display_name, created_at=player.created_at)


def _issue_session(store: PlayerStore, player: PlayerRecord) -> str:
    token = secrets.token_urlsafe(32)
    expires = datetime.now(timezone.utc) + timedelta(days=get_settings().session_days)
    store.create_session(_token_hash(token), player.id, expires.isoformat())
    return token


def sign_up(store: PlayerStore, email: str, display_name: str, password: str) -> tuple[str, PlayerOut]:
    player = store.create_player(email.strip().lower(), display_name.strip(), hash_password(password))
    if player is None:
        raise PlayerError("An account with this email already exists.", 409)
    return _issue_session(store, player), _to_player_out(player)


def sign_in(store: PlayerStore, email: str, password: str) -> tuple[str, PlayerOut]:
    player = store.find_by_email(email.strip().lower())
    if player is None or not verify_password(password, player.password_hash):
        raise PlayerError("Incorrect email or password.", 401)
    return _issue_session(store, player), _to_player_out(player)


def player_for_token(store: PlayerStore, token: str | None) -> PlayerRecord:
    player = store.player_for_session(_token_hash(token)) if token else None
    if player is None:
        raise PlayerError("Sign in to continue.", 401)
    return player


def sign_out(store: PlayerStore, token: str) -> None:
    store.delete_session(_token_hash(token))


def _validate_local_date(value: date) -> date:
    """Accept the player's own calendar date, within the span of real time zones."""
    utc_today = datetime.now(timezone.utc).date()
    if abs((value - utc_today).days) > 1:
        raise PlayerError("local_date is too far from the current date.", 422)
    return value


def record_result(store: PlayerStore, player: PlayerRecord, result: GameResultIn) -> RecordResultOut:
    if result.level_id not in GAME_LEVELS.get(result.game, []):
        raise PlayerError(f"Unknown level '{result.level_id}' for {result.game}.", 422)
    local_day = _validate_local_date(result.local_date)
    before = build_progress(store, player, local_day)
    previous_best = before.games.get(result.game, {}).get(result.level_id, {}).get("stars", 0)
    xp = xp_for_result(result.stars, previous_best)
    store.add_result(
        player.id, result.game, result.level_id, result.stars, min(result.score, MAX_SCORE), xp,
        result.meta, local_day.isoformat(),
    )
    after = build_progress(store, player, local_day)
    new_badges = [b for b in after.badges if b.earned and not any(o.id == b.id and o.earned for o in before.badges)]
    return RecordResultOut(
        xp_gained=xp,
        leveled_up=after.level > before.level,
        streak_extended=after.current_streak > before.current_streak,
        new_badges=new_badges,
        progress=after,
    )


def build_progress(store: PlayerStore, player: PlayerRecord, today: date) -> ProgressOut:
    results = store.results_for(player.id)
    total_xp = sum(r.xp for r in results)
    level, into, span = level_for_xp(total_xp)
    active = {date.fromisoformat(r.local_date) for r in results}
    current, best = streaks(active, today)
    earned = earned_badges(results, best, level)
    window = [today - timedelta(days=i) for i in range(27, -1, -1)]
    return ProgressOut(
        player=_to_player_out(player),
        xp=total_xp,
        level=level,
        level_xp=into,
        level_xp_needed=span,
        xp_today=sum(r.xp for r in results if r.local_date == today.isoformat()),
        daily_goal=DAILY_XP_GOAL,
        current_streak=current,
        best_streak=best,
        played_today=today in active,
        calendar=[{"date": d.isoformat(), "active": d in active} for d in window],
        games=best_stars(results),
        badges=[BadgeOut(id=b.id, title=b.title, description=b.description, earned=b.id in earned) for b in BADGES],
        recent=[
            RecentResultOut(game=r.game, level_id=r.level_id, stars=r.stars, score=r.score, xp=r.xp, created_at=r.created_at)
            for r in reversed(results[-8:])
        ],
        games_played=len(results),
    )
