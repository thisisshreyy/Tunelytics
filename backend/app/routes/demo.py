from fastapi import APIRouter, HTTPException

from app.services.analysis_service import compute_playlist_analysis
from app.services.demo_data import (
    DEMO_PROFILE,
    DEMO_TRACKS,
    DEMO_ARTISTS,
    DEMO_RECENTLY_PLAYED,
    DEMO_PLAYLISTS,
    DEMO_PLAYLIST_DETAILS,
    DEMO_TASTE_ANALYSIS,
)

router = APIRouter(prefix="/api/demo", tags=["demo"])


@router.get("/profile")
def demo_profile():
    return DEMO_PROFILE


@router.get("/top-tracks")
def demo_top_tracks(time_range: str = "medium_term"):
    return DEMO_TRACKS.get(time_range, DEMO_TRACKS["medium_term"])


@router.get("/top-artists")
def demo_top_artists(time_range: str = "medium_term"):
    return DEMO_ARTISTS.get(time_range, DEMO_ARTISTS["medium_term"])


@router.get("/recently-played")
def demo_recently_played():
    return DEMO_RECENTLY_PLAYED


@router.get("/playlists")
def demo_playlists():
    return DEMO_PLAYLISTS


@router.get("/playlists/{playlist_id}")
def demo_playlist(playlist_id: str):
    detail = DEMO_PLAYLIST_DETAILS.get(playlist_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Playlist not found")
    return detail


@router.get("/playlists/{playlist_id}/analysis")
def demo_playlist_analysis(playlist_id: str):
    detail = DEMO_PLAYLIST_DETAILS.get(playlist_id)
    if not detail:
        raise HTTPException(status_code=404, detail="Playlist not found")
    tracks = [
        item["track"]
        for item in detail.get("tracks", {}).get("items", [])
        if item.get("track")
    ]
    return compute_playlist_analysis(tracks)


@router.get("/taste-analysis")
def demo_taste_analysis(time_range: str = "medium_term"):
    return DEMO_TASTE_ANALYSIS.get(time_range, DEMO_TASTE_ANALYSIS["medium_term"])
