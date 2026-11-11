from datetime import date

from fastapi import APIRouter, Depends, Header, HTTPException, Query, status

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
def sign_up(body: SignUpRequest, store: PlayerStore = Depends(service.get_player_store)) -> AuthResponse:
    token, player = _guard(service.sign_up, store, body.email, body.display_name, body.password)
    return AuthResponse(token=token, player=player)


@router.post("/auth/login", response_model=AuthResponse, tags=["auth"])
def sign_in(body: SignInRequest, store: PlayerStore = Depends(service.get_player_store)) -> AuthResponse:
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
    return _guard(service.record_result, store, player, body)
