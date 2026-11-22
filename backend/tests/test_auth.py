from app.core.config import settings
from app.core.database import SessionLocal
from app.models.user import User


def test_login_unconfigured(client):
    settings.SPOTIFY_CLIENT_ID = ""
    res = client.get("/api/auth/login")
    assert res.status_code == 400
    assert "Spotify Client ID is not configured" in res.json()["detail"]


def test_login_configured(client):
    settings.SPOTIFY_CLIENT_ID = "mock_client_id_12345"
    res = client.get("/api/auth/login")
    assert res.status_code == 200
    data = res.json()
    assert "auth_url" in data
    assert "accounts.spotify.com/authorize" in data["auth_url"]
    assert "mock_client_id_12345" in data["auth_url"]
    assert "state=" in data["auth_url"]


def test_auth_config_endpoints(client):
    settings.SPOTIFY_CLIENT_ID = "test_client_id_999"
    settings.SPOTIFY_CLIENT_SECRET = "test_secret_999"

    # GET /api/auth/config
    res = client.get("/api/auth/config")
    assert res.status_code == 200
    data = res.json()
    assert data["is_configured"] is True
    assert data["client_id_configured"] is True

    # POST /api/auth/config
    res2 = client.post(
        "/api/auth/config",
        json={
            "client_id": "new_client_id",
            "client_secret": "new_secret",
            "redirect_uri": "http://localhost:5173/callback",
        },
    )
    assert res2.status_code == 200
    assert res2.json()["status"] == "ok"
    assert settings.SPOTIFY_CLIENT_ID == "new_client_id"


def test_callback_missing_or_invalid_state(client):
    res = client.get("/api/auth/callback?code=fake_code&state=nonexistent_state")
    assert res.status_code == 400
    assert "Invalid state" in res.json()["detail"]


def test_logout_endpoint(client):
    res = client.post("/api/auth/logout")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_me_without_auth(client):
    res = client.get("/api/auth/me")
    assert res.status_code == 422


def test_me_with_invalid_token(client):
    res = client.get("/api/auth/me", headers={"Authorization": "Bearer bad_token"})
    assert res.status_code == 401
    assert "User not found" in res.json()["detail"]


def test_me_with_valid_user(client):
    # Seed a test user idempotently
    db = SessionLocal()
    existing = db.query(User).filter(User.spotify_id == "test_user_123").first()
    if not existing:
        user = User(
            spotify_id="test_user_123",
            display_name="Test Listener",
            email="test@example.com",
            access_token="test_access_token",
            refresh_token="test_refresh_token",
            image_url="https://example.com/avatar.jpg",
        )
        db.add(user)
        db.commit()
    db.close()

    res = client.get("/api/auth/me", headers={"Authorization": "Bearer test_user_123"})
    assert res.status_code == 200
    data = res.json()
    assert data["display_name"] == "Test Listener"
    assert data["email"] == "test@example.com"
    assert data["id"] == "test_user_123"
