from collections import Counter


def compute_taste_analysis(top_artists: list[dict], top_tracks: list[dict]) -> dict:
    """Analyze a user's music taste from their top artists and tracks."""
    # Collect all genres from artists
    all_genres: list[str] = []
    for artist in top_artists:
        all_genres.extend(artist.get("genres", []))

    genre_counts = Counter(all_genres)
    total_genres = sum(genre_counts.values()) or 1
    genre_distribution = {
        genre: round(count / total_genres, 3)
        for genre, count in genre_counts.most_common(15)
    }

    # Mainstream score: average popularity of tracks (0–100)
    popularities = [t.get("popularity", 50) for t in top_tracks]
    mainstream_score = round(sum(popularities) / max(len(popularities), 1), 1)

    if mainstream_score >= 70:
        taste_label = "Mainstream"
    elif mainstream_score >= 40:
        taste_label = "Balanced"
    else:
        taste_label = "Indie/Underground"

    # Artist diversity: unique artists / total tracks
    unique_artist_ids: set[str] = set()
    for t in top_tracks:
        for a in t.get("artists", []):
            unique_artist_ids.add(a.get("id", ""))
    artist_diversity = round(len(unique_artist_ids) / max(len(top_tracks), 1), 2)

    top_genres = [g for g, _ in genre_counts.most_common(5)]

    return {
        "genre_distribution": genre_distribution,
        "mainstream_score": mainstream_score,
        "taste_label": taste_label,
        "artist_diversity": artist_diversity,
        "top_genres": top_genres,
    }


def compute_playlist_analysis(tracks: list[dict]) -> dict:
    """Analyze tracks in a playlist."""
    popularities = [t.get("popularity", 50) for t in tracks]
    avg_popularity = round(sum(popularities) / max(len(popularities), 1), 1)

    # Genre breakdown from track artists
    genre_counts: Counter = Counter()
    for t in tracks:
        for a in t.get("artists", []):
            for g in a.get("genres", []):
                genre_counts[g] += 1
    total_g = sum(genre_counts.values()) or 1
    genre_breakdown = {
        g: round(c / total_g, 3) for g, c in genre_counts.most_common(10)
    }

    # Decade breakdown from release dates
    decade_counts: Counter = Counter()
    for t in tracks:
        album = t.get("album", {})
        release = album.get("release_date", "")
        if release and len(release) >= 4:
            try:
                year = int(release[:4])
                decade = f"{(year // 10) * 10}s"
                decade_counts[decade] += 1
            except ValueError:
                pass
    decade_breakdown = dict(decade_counts.most_common())

    total_duration_ms = sum(t.get("duration_ms", 0) for t in tracks)

    return {
        "avg_popularity": avg_popularity,
        "genre_breakdown": genre_breakdown,
        "decade_breakdown": decade_breakdown,
        "total_duration_ms": total_duration_ms,
    }
