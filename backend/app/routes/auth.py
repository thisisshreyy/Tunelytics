import os
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User
from app.services.spotify_service import SpotifyService

router = APIRouter(prefix="/api/auth", tags=["auth"])

# In-memory state store for OAuth CSRF protection (maps state -> dict with timestamp and redirect_uri)
_pending_states: dict[str, dict] = {}


class SpotifyConfigPayload(BaseModel):
    client_id: str
    client_secret: str
    redirect_uri: str | None = None


def _get_current_user(
    db: Session = Depends(get_db),
    authorization: str = Header(...),
) -> User:
    """Extract user from Bearer token (spotify_id)."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    token = authorization[7:]
    user = db.query(User).filter(User.spotify_id == token).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.get("/config")
def get_auth_config():
    """Return whether Spotify credentials are configured and current redirect URI."""
    cid = settings.SPOTIFY_CLIENT_ID.strip() if settings.SPOTIFY_CLIENT_ID else ""
    csec = settings.SPOTIFY_CLIENT_SECRET.strip() if settings.SPOTIFY_CLIENT_SECRET else ""
    preview = None
    if cid:
        preview = f"{cid[:4]}...{cid[-4:]}" if len(cid) > 8 else "***"
    return {
        "is_configured": bool(cid and csec),
        "client_id_configured": bool(cid),
        "client_id_preview": preview,
        "redirect_uri": settings.SPOTIFY_REDIRECT_URI,
    }


@router.post("/config")
def set_auth_config(payload: SpotifyConfigPayload):
    """Save Spotify credentials into runtime settings and persist to backend/.env."""
    cid = payload.client_id.strip()
    csec = payload.client_secret.strip()
    if not cid or not csec:
        raise HTTPException(status_code=400, detail="Both Client ID and Client Secret are required.")

    settings.SPOTIFY_CLIENT_ID = cid
    settings.SPOTIFY_CLIENT_SECRET = csec
    if payload.redirect_uri:
        settings.SPOTIFY_REDIRECT_URI = payload.redirect_uri.strip()

    # Persist to .env in backend directory
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    env_path = os.path.join(backend_dir, ".env")
    try:
        lines = []
        if os.path.exists(env_path):
            with open(env_path, "r", encoding="utf-8") as f:
                lines = f.readlines()

        keys_set = set()
        new_lines = []
        for line in lines:
            if line.startswith("SPOTIFY_CLIENT_ID="):
                new_lines.append(f"SPOTIFY_CLIENT_ID={cid}\n")
                keys_set.add("SPOTIFY_CLIENT_ID")
            elif line.startswith("SPOTIFY_CLIENT_SECRET="):
                new_lines.append(f"SPOTIFY_CLIENT_SECRET={csec}\n")
                keys_set.add("SPOTIFY_CLIENT_SECRET")
            elif line.startswith("SPOTIFY_REDIRECT_URI=") and payload.redirect_uri:
                new_lines.append(f"SPOTIFY_REDIRECT_URI={payload.redirect_uri.strip()}\n")
                keys_set.add("SPOTIFY_REDIRECT_URI")
            else:
                new_lines.append(line)

        if "SPOTIFY_CLIENT_ID" not in keys_set:
            new_lines.append(f"SPOTIFY_CLIENT_ID={cid}\n")
        if "SPOTIFY_CLIENT_SECRET" not in keys_set:
            new_lines.append(f"SPOTIFY_CLIENT_SECRET={csec}\n")
        if payload.redirect_uri and "SPOTIFY_REDIRECT_URI" not in keys_set:
            new_lines.append(f"SPOTIFY_REDIRECT_URI={payload.redirect_uri.strip()}\n")

        with open(env_path, "w", encoding="utf-8") as f:
            f.writelines(new_lines)
    except Exception:
        pass

    return {
        "status": "ok",
        "message": "Spotify credentials updated successfully",
        "is_configured": True,
    }


@router.get("/login")
def login(redirect_uri: str | None = None):
    if not settings.SPOTIFY_CLIENT_ID:
        raise HTTPException(
            status_code=400,
            detail="Spotify Client ID is not configured. Please enter your credentials in Settings or add them to your .env file.",
        )
    state = str(uuid.uuid4())
    eff_redirect_uri = redirect_uri or settings.SPOTIFY_REDIRECT_URI
    _pending_states[state] = {
        "timestamp": datetime.now(timezone.utc).timestamp(),
        "redirect_uri": eff_redirect_uri,
    }
    service = SpotifyService()
    auth_url = service.get_auth_url(state, redirect_uri=eff_redirect_uri)
    return {"auth_url": auth_url}


@router.get("/callback")
def callback(code: str, state: str, db: Session = Depends(get_db)):
    # Verify state
    if state not in _pending_states:
        raise HTTPException(status_code=400, detail="Invalid state parameter or authorization session expired")
    state_data = _pending_states.pop(state)
    redirect_uri = state_data.get("redirect_uri") if isinstance(state_data, dict) else settings.SPOTIFY_REDIRECT_URI

    # Exchange code for tokens
    service = SpotifyService()
    token_data = service.exchange_code(code, redirect_uri=redirect_uri)

    access_token = token_data["access_token"]
    refresh_token = token_data.get("refresh_token", "")
    expires_in = token_data.get("expires_in", 3600)
    token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)

    # Get user profile
    service.access_token = access_token
    profile = service.get_current_user()

    spotify_id = profile["id"]
    display_name = profile.get("display_name", "")
    email = profile.get("email")
    images = profile.get("images", [])
    image_url = images[0]["url"] if images else None

    # Upsert user
    user = db.query(User).filter(User.spotify_id == spotify_id).first()
    if user:
        user.display_name = display_name
        user.email = email
        user.image_url = image_url
        user.access_token = access_token
        user.refresh_token = refresh_token
        user.token_expires_at = token_expires_at
    else:
        user = User(
            spotify_id=spotify_id,
            display_name=display_name,
            email=email,
            image_url=image_url,
            access_token=access_token,
            refresh_token=refresh_token,
            token_expires_at=token_expires_at,
        )
        db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "token": spotify_id,
        "user": {
            "id": spotify_id,
            "display_name": display_name,
            "email": email,
            "image_url": image_url,
        },
    }


@router.get("/me")
def me(user: User = Depends(_get_current_user)):
    return {
        "id": user.spotify_id,
        "display_name": user.display_name,
        "email": user.email,
        "image_url": user.image_url,
    }


@router.post("/logout")
def logout():
    return {"status": "ok"}


@router.post("/refresh")
def refresh(
    user: User = Depends(_get_current_user),
    db: Session = Depends(get_db),
):
    service = SpotifyService()
    token_data = service.refresh_access_token(user.refresh_token)

    user.access_token = token_data["access_token"]
    if "refresh_token" in token_data:
        user.refresh_token = token_data["refresh_token"]
    expires_in = token_data.get("expires_in", 3600)
    user.token_expires_at = datetime.now(timezone.utc) + timedelta(seconds=expires_in)
    db.commit()

    return {"status": "ok", "token": user.spotify_id}
