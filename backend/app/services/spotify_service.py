from urllib.parse import urlencode

import httpx
from fastapi import HTTPException

from app.core.config import settings

SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize"
SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token"
SPOTIFY_API_BASE = "https://api.spotify.com/v1"

SCOPES = " ".join([
    "user-read-private",
    "user-read-email",
    "user-top-read",
    "user-read-recently-played",
    "playlist-read-private",
    "playlist-read-collaborative",
])


class SpotifyService:
    def __init__(self, access_token: str | None = None):
        self.access_token = access_token

    def get_auth_url(self, state: str, redirect_uri: str | None = None) -> str:
        params = {
            "client_id": settings.SPOTIFY_CLIENT_ID,
            "response_type": "code",
            "redirect_uri": redirect_uri or settings.SPOTIFY_REDIRECT_URI,
            "scope": SCOPES,
            "state": state,
        }
        return f"{SPOTIFY_AUTH_URL}?{urlencode(params)}"

    def exchange_code(self, code: str, redirect_uri: str | None = None) -> dict:
        data = {
            "grant_type": "authorization_code",
            "code": code,
            "redirect_uri": redirect_uri or settings.SPOTIFY_REDIRECT_URI,
            "client_id": settings.SPOTIFY_CLIENT_ID,
            "client_secret": settings.SPOTIFY_CLIENT_SECRET,
        }
        with httpx.Client() as client:
            response = client.post(SPOTIFY_TOKEN_URL, data=data)
            if response.status_code != 200:
                try:
                    err_json = response.json()
                    err_desc = err_json.get("error_description") or err_json.get("error") or response.text
                except Exception:
                    err_desc = response.text
                raise HTTPException(
                    status_code=400,
                    detail=f"Spotify token exchange failed ({response.status_code}): {err_desc}",
                )
            return response.json()

    def refresh_access_token(self, refresh_token: str) -> dict:
        data = {
            "grant_type": "refresh_token",
            "refresh_token": refresh_token,
            "client_id": settings.SPOTIFY_CLIENT_ID,
            "client_secret": settings.SPOTIFY_CLIENT_SECRET,
        }
        with httpx.Client() as client:
            response = client.post(SPOTIFY_TOKEN_URL, data=data)
            if response.status_code != 200:
                try:
                    err_json = response.json()
                    err_desc = err_json.get("error_description") or err_json.get("error") or response.text
                except Exception:
                    err_desc = response.text
                raise HTTPException(
                    status_code=400,
                    detail=f"Spotify token refresh failed ({response.status_code}): {err_desc}",
                )
            return response.json()

    def _request(self, method: str, url: str, **kwargs) -> dict:
        headers = {"Authorization": f"Bearer {self.access_token}"}
        with httpx.Client() as client:
            response = client.request(method, url, headers=headers, **kwargs)

            if response.status_code == 429:
                retry_after = response.headers.get("Retry-After", "5")
                raise HTTPException(
                    status_code=429,
                    detail=f"Rate limited. Retry after {retry_after}s",
                )
            if response.status_code == 401:
                raise HTTPException(status_code=401, detail="Unauthorized – token expired")
            if response.status_code == 403:
                raise HTTPException(status_code=403, detail="Forbidden")
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Spotify API error: {response.text}",
                )
            return response.json()

    def get_current_user(self) -> dict:
        return self._request("GET", f"{SPOTIFY_API_BASE}/me")

    def get_top_tracks(self, time_range: str = "medium_term", limit: int = 20) -> dict:
        return self._request(
            "GET",
            f"{SPOTIFY_API_BASE}/me/top/tracks",
            params={"time_range": time_range, "limit": limit},
        )

    def get_top_artists(self, time_range: str = "medium_term", limit: int = 20) -> dict:
        return self._request(
            "GET",
            f"{SPOTIFY_API_BASE}/me/top/artists",
            params={"time_range": time_range, "limit": limit},
        )

    def get_recently_played(self, limit: int = 20) -> dict:
        return self._request(
            "GET",
            f"{SPOTIFY_API_BASE}/me/player/recently-played",
            params={"limit": limit},
        )

    def get_playlists(self, limit: int = 20) -> dict:
        return self._request(
            "GET",
            f"{SPOTIFY_API_BASE}/me/playlists",
            params={"limit": limit},
        )

    def get_playlist(self, playlist_id: str) -> dict:
        return self._request("GET", f"{SPOTIFY_API_BASE}/playlists/{playlist_id}")
