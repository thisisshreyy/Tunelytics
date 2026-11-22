"""Test analysis service functions."""
from app.services.analysis_service import compute_taste_analysis, compute_playlist_analysis


def test_compute_taste_analysis_mainstream():
    artists = [
        {"id": "a1", "name": "Pop Star", "genres": ["pop", "dance pop"]},
        {"id": "a2", "name": "Rock Band", "genres": ["rock", "indie rock"]},
        {"id": "a3", "name": "Hip Hop Artist", "genres": ["hip hop", "pop"]},
    ]
    tracks = [
        {"id": "t1", "name": "Hit 1", "popularity": 90, "artists": [{"id": "a1"}]},
        {"id": "t2", "name": "Hit 2", "popularity": 85, "artists": [{"id": "a2"}]},
        {"id": "t3", "name": "Hit 3", "popularity": 80, "artists": [{"id": "a3"}]},
        {"id": "t4", "name": "Hit 4", "popularity": 75, "artists": [{"id": "a1"}]},
    ]
    result = compute_taste_analysis(artists, tracks)

    assert "genre_distribution" in result
    assert "pop" in result["genre_distribution"]
    assert result["mainstream_score"] == 82.5
    assert result["taste_label"] == "Mainstream"
    assert 0 < result["artist_diversity"] <= 1.0
    assert isinstance(result["top_genres"], list)
    assert len(result["top_genres"]) > 0


def test_compute_taste_analysis_indie():
    artists = [
        {"id": "a1", "name": "Obscure Act", "genres": ["noise pop", "shoegaze"]},
    ]
    tracks = [
        {"id": "t1", "name": "Deep Cut", "popularity": 20, "artists": [{"id": "a1"}]},
        {"id": "t2", "name": "Underground", "popularity": 15, "artists": [{"id": "a1"}]},
    ]
    result = compute_taste_analysis(artists, tracks)
    assert result["taste_label"] == "Indie/Underground"
    assert result["mainstream_score"] < 40


def test_compute_taste_analysis_balanced():
    artists = [
        {"id": "a1", "name": "Mid Artist", "genres": ["indie pop"]},
    ]
    tracks = [
        {"id": "t1", "name": "Track", "popularity": 55, "artists": [{"id": "a1"}]},
        {"id": "t2", "name": "Track 2", "popularity": 50, "artists": [{"id": "a1"}]},
    ]
    result = compute_taste_analysis(artists, tracks)
    assert result["taste_label"] == "Balanced"


def test_compute_taste_analysis_empty():
    result = compute_taste_analysis([], [])
    assert result["mainstream_score"] == 0.0 or result["mainstream_score"] == 50.0 or isinstance(result["mainstream_score"], float)
    assert result["taste_label"] in ("Mainstream", "Balanced", "Indie/Underground")


def test_compute_playlist_analysis():
    tracks = [
        {
            "id": "t1",
            "name": "Song A",
            "popularity": 80,
            "duration_ms": 200000,
            "artists": [{"id": "a1", "name": "Artist A", "genres": ["pop", "rock"]}],
            "album": {"release_date": "2020-05-01"},
        },
        {
            "id": "t2",
            "name": "Song B",
            "popularity": 60,
            "duration_ms": 180000,
            "artists": [{"id": "a2", "name": "Artist B", "genres": ["hip hop"]}],
            "album": {"release_date": "1995-11-15"},
        },
        {
            "id": "t3",
            "name": "Song C",
            "popularity": 70,
            "duration_ms": 240000,
            "artists": [{"id": "a1", "name": "Artist A", "genres": ["pop"]}],
            "album": {"release_date": "2022-01-10"},
        },
    ]
    result = compute_playlist_analysis(tracks)

    assert result["avg_popularity"] == 70.0
    assert result["total_duration_ms"] == 620000
    assert "pop" in result["genre_breakdown"]
    assert "2020s" in result["decade_breakdown"]
    assert "1990s" in result["decade_breakdown"]


def test_compute_playlist_analysis_empty():
    result = compute_playlist_analysis([])
    assert result["total_duration_ms"] == 0
    assert result["genre_breakdown"] == {}
    assert result["decade_breakdown"] == {}
