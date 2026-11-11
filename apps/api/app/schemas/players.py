from datetime import date
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


class SignUpRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    display_name: str = Field(min_length=2, max_length=32)
    password: str = Field(min_length=8, max_length=128)

    @field_validator("email")
    @classmethod
    def email_shape(cls, value: str) -> str:
        value = value.strip()
        local, _, domain = value.partition("@")
        if not local or "." not in domain or " " in value:
            raise ValueError("Enter a valid email address.")
        return value

    @field_validator("display_name")
    @classmethod
    def name_not_blank(cls, value: str) -> str:
        if len(value.strip()) < 2:
            raise ValueError("Display name needs at least 2 characters.")
        return value


class SignInRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=128)


class PlayerOut(BaseModel):
    id: int
    email: str
    display_name: str
    created_at: str


class AuthResponse(BaseModel):
    token: str
    player: PlayerOut


class GameResultIn(BaseModel):
    game: Literal["golf", "rewind"]
    level_id: str = Field(min_length=1, max_length=40)
    stars: int = Field(ge=0, le=3)
    score: int = Field(ge=0)
    meta: dict[str, Any] = Field(default_factory=dict)
    local_date: date


class BadgeOut(BaseModel):
    id: str
    title: str
    description: str
    earned: bool


class RecentResultOut(BaseModel):
    game: str
    level_id: str
    stars: int
    score: int
    xp: int
    created_at: str


class CalendarDay(BaseModel):
    date: str
    active: bool


class ProgressOut(BaseModel):
    player: PlayerOut
    xp: int
    level: int
    level_xp: int
    level_xp_needed: int
    xp_today: int
    daily_goal: int
    current_streak: int
    best_streak: int
    played_today: bool
    calendar: list[CalendarDay]
    games: dict[str, dict[str, dict[str, int]]]
    badges: list[BadgeOut]
    recent: list[RecentResultOut]
    games_played: int


class RecordResultOut(BaseModel):
    xp_gained: int
    leveled_up: bool
    streak_extended: bool
    new_badges: list[BadgeOut]
    progress: ProgressOut
