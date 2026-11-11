"""Postgres-backed player store, used when MLINGO_PLAYERS_DATABASE_URL is set.

Same interface as the SQLite PlayerStore. Serverless hosts (Vercel) have no
persistent disk, so a hosted database is required there.

Supabase notes:
- Tables live in a private `mlingo` schema. Supabase's Data API exposes `public`
  by default, which would make emails and password hashes readable with the
  project's public anon key. Row-level security is also enabled with no
  policies, as a second lock; the backend's direct connection is unaffected.
- Use the transaction pooler URL (port 6543) on serverless. Prepared statements
  are disabled because the transaction pooler does not support them.
"""

from __future__ import annotations

import json
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import datetime, timezone
from typing import Any

import psycopg
from psycopg.rows import dict_row

from app.players.store import PlayerRecord, ResultRecord

SCHEMA = """
CREATE SCHEMA IF NOT EXISTS mlingo;
CREATE TABLE IF NOT EXISTS mlingo.players (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS mlingo.sessions (
    token_hash TEXT PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES mlingo.players(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS mlingo.game_results (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES mlingo.players(id) ON DELETE CASCADE,
    game TEXT NOT NULL,
    level_id TEXT NOT NULL,
    stars INTEGER NOT NULL,
    score INTEGER NOT NULL,
    xp INTEGER NOT NULL,
    meta TEXT NOT NULL,
    local_date TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_results_player ON mlingo.game_results(player_id, created_at);
ALTER TABLE mlingo.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE mlingo.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mlingo.game_results ENABLE ROW LEVEL SECURITY;
"""


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _player(row: dict[str, Any] | None) -> PlayerRecord | None:
    return PlayerRecord(**row) if row else None


class PostgresPlayerStore:
    def __init__(self, url: str) -> None:
        self._url = url
        with self._connect() as conn:
            conn.execute(SCHEMA)

    @contextmanager
    def _connect(self) -> Iterator[psycopg.Connection]:
        # One short connection per operation: serverless instances are frozen
        # between requests, so long-lived connections would go stale.
        with psycopg.connect(self._url, autocommit=True, prepare_threshold=None, row_factory=dict_row) as conn:
            yield conn

    def create_player(self, email: str, display_name: str, password_hash: str) -> PlayerRecord | None:
        with self._connect() as conn:
            try:
                row = conn.execute(
                    "INSERT INTO mlingo.players (email, display_name, password_hash, created_at)"
                    " VALUES (%s, %s, %s, %s) RETURNING *",
                    (email, display_name, password_hash, _now()),
                ).fetchone()
            except psycopg.errors.UniqueViolation:
                return None
        return _player(row)

    def get_player(self, player_id: int) -> PlayerRecord | None:
        with self._connect() as conn:
            return _player(conn.execute("SELECT * FROM mlingo.players WHERE id = %s", (player_id,)).fetchone())

    def find_by_email(self, email: str) -> PlayerRecord | None:
        with self._connect() as conn:
            return _player(conn.execute("SELECT * FROM mlingo.players WHERE email = %s", (email,)).fetchone())

    def create_session(self, token_hash: str, player_id: int, expires_at: str) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO mlingo.sessions (token_hash, player_id, expires_at) VALUES (%s, %s, %s)",
                (token_hash, player_id, expires_at),
            )

    def player_for_session(self, token_hash: str) -> PlayerRecord | None:
        with self._connect() as conn:
            row = conn.execute(
                "SELECT p.*, s.expires_at AS _expires_at FROM mlingo.sessions s"
                " JOIN mlingo.players p ON p.id = s.player_id WHERE s.token_hash = %s",
                (token_hash,),
            ).fetchone()
            if row is None:
                return None
            if row.pop("_expires_at") < _now():
                conn.execute("DELETE FROM mlingo.sessions WHERE token_hash = %s", (token_hash,))
                return None
        return _player(row)

    def delete_session(self, token_hash: str) -> None:
        with self._connect() as conn:
            conn.execute("DELETE FROM mlingo.sessions WHERE token_hash = %s", (token_hash,))

    def add_result(
        self, player_id: int, game: str, level_id: str, stars: int, score: int, xp: int, meta: dict, local_date: str
    ) -> None:
        with self._connect() as conn:
            conn.execute(
                "INSERT INTO mlingo.game_results"
                " (player_id, game, level_id, stars, score, xp, meta, local_date, created_at)"
                " VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                (player_id, game, level_id, stars, score, xp, json.dumps(meta), local_date, _now()),
            )

    def results_for(self, player_id: int) -> list[ResultRecord]:
        with self._connect() as conn:
            rows = conn.execute(
                "SELECT * FROM mlingo.game_results WHERE player_id = %s ORDER BY id", (player_id,)
            ).fetchall()
        return [
            ResultRecord(
                id=r["id"],
                game=r["game"],
                level_id=r["level_id"],
                stars=r["stars"],
                score=r["score"],
                xp=r["xp"],
                meta=json.loads(r["meta"]),
                local_date=r["local_date"],
                created_at=r["created_at"],
            )
            for r in rows
        ]
