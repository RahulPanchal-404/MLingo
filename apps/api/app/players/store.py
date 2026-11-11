"""SQLite-backed persistence for player accounts, sessions and game results.

Uses only the standard library so the API keeps its small dependency footprint.
Training history stays in memory; this store only holds lightweight player data.
"""

from __future__ import annotations

import json
import sqlite3
import threading
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

SCHEMA = """
CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS game_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL REFERENCES players(id) ON DELETE CASCADE,
    game TEXT NOT NULL,
    level_id TEXT NOT NULL,
    stars INTEGER NOT NULL,
    score INTEGER NOT NULL,
    xp INTEGER NOT NULL,
    meta TEXT NOT NULL,
    local_date TEXT NOT NULL,
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_results_player ON game_results(player_id, created_at);
"""


@dataclass(frozen=True)
class PlayerRecord:
    id: int
    email: str
    display_name: str
    password_hash: str
    created_at: str


@dataclass(frozen=True)
class ResultRecord:
    id: int
    game: str
    level_id: str
    stars: int
    score: int
    xp: int
    meta: dict
    local_date: str
    created_at: str


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


class PlayerStore:
    def __init__(self, path: str) -> None:
        if path != ":memory:":
            Path(path).parent.mkdir(parents=True, exist_ok=True)
        self._conn = sqlite3.connect(path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        self._conn.execute("PRAGMA foreign_keys = ON")
        self._lock = threading.Lock()
        with self._lock:
            self._conn.executescript(SCHEMA)
            self._conn.commit()

    def create_player(self, email: str, display_name: str, password_hash: str) -> PlayerRecord | None:
        with self._lock:
            try:
                cur = self._conn.execute(
                    "INSERT INTO players (email, display_name, password_hash, created_at) VALUES (?, ?, ?, ?)",
                    (email, display_name, password_hash, _now()),
                )
                self._conn.commit()
            except sqlite3.IntegrityError:
                return None
        return self.get_player(cur.lastrowid)

    def get_player(self, player_id: int) -> PlayerRecord | None:
        row = self._conn.execute("SELECT * FROM players WHERE id = ?", (player_id,)).fetchone()
        return PlayerRecord(**dict(row)) if row else None

    def find_by_email(self, email: str) -> PlayerRecord | None:
        row = self._conn.execute("SELECT * FROM players WHERE email = ?", (email,)).fetchone()
        return PlayerRecord(**dict(row)) if row else None

    def create_session(self, token_hash: str, player_id: int, expires_at: str) -> None:
        with self._lock:
            self._conn.execute(
                "INSERT INTO sessions (token_hash, player_id, expires_at) VALUES (?, ?, ?)",
                (token_hash, player_id, expires_at),
            )
            self._conn.commit()

    def player_for_session(self, token_hash: str) -> PlayerRecord | None:
        row = self._conn.execute(
            "SELECT player_id, expires_at FROM sessions WHERE token_hash = ?", (token_hash,)
        ).fetchone()
        if row is None:
            return None
        if row["expires_at"] < _now():
            self.delete_session(token_hash)
            return None
        return self.get_player(row["player_id"])

    def delete_session(self, token_hash: str) -> None:
        with self._lock:
            self._conn.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))
            self._conn.commit()

    def add_result(
        self, player_id: int, game: str, level_id: str, stars: int, score: int, xp: int, meta: dict, local_date: str
    ) -> None:
        with self._lock:
            self._conn.execute(
                "INSERT INTO game_results (player_id, game, level_id, stars, score, xp, meta, local_date, created_at)"
                " VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (player_id, game, level_id, stars, score, xp, json.dumps(meta), local_date, _now()),
            )
            self._conn.commit()

    def results_for(self, player_id: int) -> list[ResultRecord]:
        rows = self._conn.execute(
            "SELECT * FROM game_results WHERE player_id = ? ORDER BY id", (player_id,)
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
