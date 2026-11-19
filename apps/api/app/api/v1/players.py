from datetime import date

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, status

from app.core.ratelimit import client_ip, hit

from app.players.store import PlayerRecord, PlayerStore
from app.schemas.players import (
    AuthResponse,
    GameResultIn,
    PlayerOut,
    ProgressOut,
    RecordResultOut,
    SignInRequest,
    SignUpRequest,
)
from app.services import players as service

router = APIRouter()


def _bearer(authorization: str | None = Header(default=None)) -> str | None:
    if authorization and authorization.lower().startswith("bearer "):
        return authorization[7:].strip()
    return None


def _guard(fn, *args):
    try:
        return fn(*args)
    except service.PlayerError as error:
        raise HTTPException(status_code=error.status_code, detail=error.message) from error


def current_player(
    token: str | None = Depends(_bearer), store: PlayerStore = Depends(service.get_player_store)
) -> PlayerRecord:
    return _guard(service.player_for_token, store, token)


@router.post("/auth/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED, tags=["auth"])
def sign_up(body: SignUpRequest, request: Request, store: PlayerStore = Depends(service.get_player_store)) -> AuthResponse:
    hit(f"signup:{client_ip(request)}", limit=5, window_seconds=3600)
    token, player = _guard(service.sign_up, store, body.email, body.display_name, body.password)
    return AuthResponse(token=token, player=player)


@router.post("/auth/login", response_model=AuthResponse, tags=["auth"])
def sign_in(body: SignInRequest, request: Request, store: PlayerStore = Depends(service.get_player_store)) -> AuthResponse:
    # Slow down password guessing: per caller, and per targeted account.
    hit(f"login-ip:{client_ip(request)}", limit=10, window_seconds=300)
    hit(f"login-email:{body.email.strip().lower()}", limit=10, window_seconds=900)
    token, player = _guard(service.sign_in, store, body.email, body.password)
    return AuthResponse(token=token, player=player)


@router.post("/auth/logout", status_code=status.HTTP_204_NO_CONTENT, tags=["auth"])
def sign_out(token: str | None = Depends(_bearer), store: PlayerStore = Depends(service.get_player_store)) -> None:
    if token:
        service.sign_out(store, token)


@router.get("/auth/me", response_model=PlayerOut, tags=["auth"])
def me(player: PlayerRecord = Depends(current_player)) -> PlayerOut:
    return PlayerOut(id=player.id, email=player.email, display_name=player.display_name, created_at=player.created_at)


@router.get("/players/me/progress", response_model=ProgressOut, tags=["players"])
def progress(
    local_date: date = Query(...),
    player: PlayerRecord = Depends(current_player),
    store: PlayerStore = Depends(service.get_player_store),
) -> ProgressOut:
    return service.build_progress(store, player, local_date)


@router.post("/players/me/results", response_model=RecordResultOut, status_code=status.HTTP_201_CREATED, tags=["players"])
def record(
    body: GameResultIn,
    player: PlayerRecord = Depends(current_player),
    store: PlayerStore = Depends(service.get_player_store),
) -> RecordResultOut:
    # A real player finishes at most a few levels a minute; scripts get throttled.
    hit(f"results-min:{player.id}", limit=20, window_seconds=60)
    hit(f"results-day:{player.id}", limit=500, window_seconds=86_400)
    return _guard(service.record_result, store, player, body)
