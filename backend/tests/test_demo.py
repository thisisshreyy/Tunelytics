"""Test all demo endpoints return 200."""


def test_demo_profile(client):
    r = client.get("/api/demo/profile")
    assert r.status_code == 200
    data = r.json()
    assert data["display_name"] == "Demo Listener"


def test_demo_top_tracks_default(client):
    r = client.get("/api/demo/top-tracks")
    assert r.status_code == 200
    assert "items" in r.json()


def test_demo_top_tracks_short_term(client):
    r = client.get("/api/demo/top-tracks?time_range=short_term")
    assert r.status_code == 200
    assert len(r.json()["items"]) > 0


def test_demo_top_tracks_long_term(client):
    r = client.get("/api/demo/top-tracks?time_range=long_term")
    assert r.status_code == 200


def test_demo_top_artists_default(client):
    r = client.get("/api/demo/top-artists")
    assert r.status_code == 200
    assert "items" in r.json()


def test_demo_top_artists_short_term(client):
    r = client.get("/api/demo/top-artists?time_range=short_term")
    assert r.status_code == 200


def test_demo_recently_played(client):
    r = client.get("/api/demo/recently-played")
    assert r.status_code == 200
    assert "items" in r.json()


def test_demo_playlists(client):
    r = client.get("/api/demo/playlists")
    assert r.status_code == 200
    items = r.json()["items"]
    assert len(items) == 5


def test_demo_playlist_detail(client):
    r = client.get("/api/demo/playlists/pl01")
    assert r.status_code == 200
    data = r.json()
    assert data["name"] == "Chill Vibes"
    assert "tracks" in data


def test_demo_playlist_analysis(client):
    r = client.get("/api/demo/playlists/pl01/analysis")
    assert r.status_code == 200
    data = r.json()
    assert "avg_popularity" in data
    assert "decade_breakdown" in data
    assert "total_duration_ms" in data


def test_demo_playlist_not_found(client):
    r = client.get("/api/demo/playlists/nonexistent")
    assert r.status_code == 404


def test_demo_taste_analysis_default(client):
    r = client.get("/api/demo/taste-analysis")
    assert r.status_code == 200
    data = r.json()
    assert "mainstream_score" in data
    assert "taste_label" in data
    assert "genre_distribution" in data


def test_demo_taste_analysis_short_term(client):
    r = client.get("/api/demo/taste-analysis?time_range=short_term")
    assert r.status_code == 200


def test_demo_taste_analysis_long_term(client):
    r = client.get("/api/demo/taste-analysis?time_range=long_term")
    assert r.status_code == 200


def test_health_check(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"
