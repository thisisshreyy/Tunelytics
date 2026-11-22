from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.services.spotify_service import SpotifyService
from app.services.analysis_service import compute_taste_analysis, compute_playlist_analysis

router = APIRouter(prefix="/api/spotify", tags=["spotify"])


def _get_authenticated_user(
    db: Session = Depends(get_db),
    authorization: str = Header(...),
) -> User:
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization[7:]
    user = db.query(User).filter(User.spotify_id == token).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def _spotify(user: User) -> SpotifyService:
    return SpotifyService(access_token=user.access_token)


@router.get("/top-tracks")
def top_tracks(
    time_range: str = "medium_term",
    limit: int = 20,
    user: User = Depends(_get_authenticated_user),
):
    return _spotify(user).get_top_tracks(time_range=time_range, limit=limit)


@router.get("/top-artists")
def top_artists(
    time_range: str = "medium_term",
    limit: int = 20,
    user: User = Depends(_get_authenticated_user),
):
    return _spotify(user).get_top_artists(time_range=time_range, limit=limit)


@router.get("/recently-played")
def recently_played(
    limit: int = 20,
    user: User = Depends(_get_authenticated_user),
):
    return _spotify(user).get_recently_played(limit=limit)


@router.get("/playlists")
def playlists(
    limit: int = 20,
    user: User = Depends(_get_authenticated_user),
):
    return _spotify(user).get_playlists(limit=limit)


@router.get("/playlists/{playlist_id}")
def playlist(
    playlist_id: str,
    user: User = Depends(_get_authenticated_user),
):
    return _spotify(user).get_playlist(playlist_id)


@router.get("/playlists/{playlist_id}/analysis")
def playlist_analysis(
    playlist_id: str,
    user: User = Depends(_get_authenticated_user),
):
    service = _spotify(user)
    data = service.get_playlist(playlist_id)
    tracks = [item["track"] for item in data.get("tracks", {}).get("items", []) if item.get("track")]
    return compute_playlist_analysis(tracks)


@router.get("/taste-analysis")
def taste_analysis(
    time_range: str = "medium_term",
    user: User = Depends(_get_authenticated_user),
):
    service = _spotify(user)
    artists_data = service.get_top_artists(time_range=time_range, limit=50)
    tracks_data = service.get_top_tracks(time_range=time_range, limit=50)
    return compute_taste_analysis(
        artists_data.get("items", []),
        tracks_data.get("items", []),
    )
