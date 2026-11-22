"""Realistic demo data using real well-known song/artist names."""

_IMG = "https://placehold.co/300x300/1a1a2e/8b5cf6?text="


def _track(tid, name, artist_id, artist_name, album_name, release_date, duration_ms, popularity, genres=None):
    return {
        "id": tid,
        "name": name,
        "artists": [{"id": artist_id, "name": artist_name, "genres": genres or []}],
        "album": {
            "id": f"album-{tid}",
            "name": album_name,
            "images": [{"url": f"{_IMG}{album_name.replace(' ', '+')}", "height": 300, "width": 300}],
            "release_date": release_date,
        },
        "duration_ms": duration_ms,
        "popularity": popularity,
        "external_urls": {"spotify": "#"},
    }


def _artist(aid, name, genres, popularity, followers):
    return {
        "id": aid,
        "name": name,
        "images": [{"url": f"{_IMG}{name.replace(' ', '+')}", "height": 300, "width": 300}],
        "genres": genres,
        "popularity": popularity,
        "followers": {"total": followers},
        "external_urls": {"spotify": "#"},
    }


# ── Artists ──────────────────────────────────────────────────────────
_ARTISTS = [
    _artist("ar01", "The Weeknd", ["canadian pop", "pop", "r&b"], 95, 85000000),
    _artist("ar02", "Taylor Swift", ["pop", "country pop", "indie pop"], 98, 100000000),
    _artist("ar03", "Ed Sheeran", ["pop", "singer-songwriter", "folk pop"], 92, 90000000),
    _artist("ar04", "Billie Eilish", ["electropop", "pop", "alt pop"], 90, 70000000),
    _artist("ar05", "Dua Lipa", ["pop", "dance pop", "disco"], 88, 55000000),
    _artist("ar06", "Harry Styles", ["pop", "brit pop", "rock"], 87, 50000000),
    _artist("ar07", "Drake", ["hip hop", "rap", "canadian pop"], 96, 75000000),
    _artist("ar08", "Kendrick Lamar", ["hip hop", "west coast rap", "conscious hip hop"], 91, 40000000),
    _artist("ar09", "Arctic Monkeys", ["indie rock", "alternative rock", "garage rock"], 85, 30000000),
    _artist("ar10", "Tame Impala", ["psychedelic pop", "indie rock", "synth pop"], 82, 20000000),
    _artist("ar11", "Queen", ["classic rock", "glam rock", "arena rock"], 89, 45000000),
    _artist("ar12", "Radiohead", ["alternative rock", "art rock", "electronic"], 80, 15000000),
    _artist("ar13", "Bad Bunny", ["reggaeton", "latin trap", "urbano latino"], 97, 65000000),
    _artist("ar14", "SZA", ["r&b", "neo soul", "pop"], 88, 25000000),
    _artist("ar15", "Olivia Rodrigo", ["pop", "pop rock", "alt pop"], 86, 35000000),
    _artist("ar16", "Post Malone", ["pop rap", "hip hop", "melodic rap"], 89, 50000000),
    _artist("ar17", "Doja Cat", ["pop", "hip hop", "dance pop"], 87, 40000000),
    _artist("ar18", "Frank Ocean", ["r&b", "alternative r&b", "neo soul"], 83, 18000000),
    _artist("ar19", "Lana Del Rey", ["indie pop", "art pop", "dream pop"], 84, 30000000),
    _artist("ar20", "Tyler, The Creator", ["hip hop", "alternative hip hop", "neo soul"], 86, 28000000),
    _artist("ar21", "Beyonce", ["pop", "r&b", "dance pop"], 94, 60000000),
]

# ── Tracks ───────────────────────────────────────────────────────────
_ALL_TRACKS = [
    _track("t01", "Blinding Lights", "ar01", "The Weeknd", "After Hours", "2020-03-20", 200040, 95, ["canadian pop", "pop"]),
    _track("t02", "Save Your Tears", "ar01", "The Weeknd", "After Hours", "2020-03-20", 215627, 90, ["canadian pop", "pop"]),
    _track("t03", "Anti-Hero", "ar02", "Taylor Swift", "Midnights", "2022-10-21", 200690, 94, ["pop"]),
    _track("t04", "Cruel Summer", "ar02", "Taylor Swift", "Lover", "2019-08-23", 178427, 92, ["pop"]),
    _track("t05", "Shape of You", "ar03", "Ed Sheeran", "Divide", "2017-01-06", 233713, 93, ["pop", "singer-songwriter"]),
    _track("t06", "Perfect", "ar03", "Ed Sheeran", "Divide", "2017-01-06", 263400, 88, ["pop", "singer-songwriter"]),
    _track("t07", "bad guy", "ar04", "Billie Eilish", "When We All Fall Asleep", "2019-03-29", 194088, 91, ["electropop", "pop"]),
    _track("t08", "Happier Than Ever", "ar04", "Billie Eilish", "Happier Than Ever", "2021-07-30", 298899, 85, ["alt pop"]),
    _track("t09", "Levitating", "ar05", "Dua Lipa", "Future Nostalgia", "2020-03-27", 203064, 90, ["pop", "dance pop"]),
    _track("t10", "Don't Start Now", "ar05", "Dua Lipa", "Future Nostalgia", "2020-03-27", 183290, 88, ["pop", "disco"]),
    _track("t11", "As It Was", "ar06", "Harry Styles", "Harry's House", "2022-05-20", 167303, 93, ["pop", "brit pop"]),
    _track("t12", "Watermelon Sugar", "ar06", "Harry Styles", "Fine Line", "2019-12-13", 174000, 89, ["pop", "rock"]),
    _track("t13", "God's Plan", "ar07", "Drake", "Scorpion", "2018-06-29", 198973, 92, ["hip hop", "rap"]),
    _track("t14", "Hotline Bling", "ar07", "Drake", "Views", "2016-04-29", 267067, 87, ["hip hop", "pop"]),
    _track("t15", "HUMBLE.", "ar08", "Kendrick Lamar", "DAMN.", "2017-04-14", 177000, 90, ["hip hop", "west coast rap"]),
    _track("t16", "DNA.", "ar08", "Kendrick Lamar", "DAMN.", "2017-04-14", 185000, 86, ["hip hop"]),
    _track("t17", "Do I Wanna Know?", "ar09", "Arctic Monkeys", "AM", "2013-09-09", 272394, 85, ["indie rock", "alternative rock"]),
    _track("t18", "505", "ar09", "Arctic Monkeys", "Favourite Worst Nightmare", "2007-04-23", 253573, 88, ["indie rock"]),
    _track("t19", "The Less I Know the Better", "ar10", "Tame Impala", "Currents", "2015-07-17", 216320, 87, ["psychedelic pop", "indie rock"]),
    _track("t20", "Let It Happen", "ar10", "Tame Impala", "Currents", "2015-07-17", 467586, 80, ["psychedelic pop"]),
    _track("t21", "Bohemian Rhapsody", "ar11", "Queen", "A Night at the Opera", "1975-10-31", 354947, 89, ["classic rock", "glam rock"]),
    _track("t22", "Somebody to Love", "ar11", "Queen", "A Day at the Races", "1976-12-10", 296733, 83, ["classic rock"]),
    _track("t23", "Creep", "ar12", "Radiohead", "Pablo Honey", "1993-02-22", 238640, 82, ["alternative rock"]),
    _track("t24", "Karma Police", "ar12", "Radiohead", "OK Computer", "1997-06-16", 264066, 79, ["alternative rock", "art rock"]),
    _track("t25", "Dakiti", "ar13", "Bad Bunny", "El Ultimo Tour Del Mundo", "2020-11-27", 205090, 88, ["reggaeton", "latin trap"]),
    _track("t26", "Titi Me Pregunto", "ar13", "Bad Bunny", "Un Verano Sin Ti", "2022-05-06", 243200, 91, ["reggaeton"]),
    _track("t27", "Kill Bill", "ar14", "SZA", "SOS", "2022-12-09", 153947, 92, ["r&b", "pop"]),
    _track("t28", "Good Days", "ar14", "SZA", "Good Days", "2020-12-25", 279204, 84, ["r&b", "neo soul"]),
    _track("t29", "drivers license", "ar15", "Olivia Rodrigo", "SOUR", "2021-05-21", 242014, 90, ["pop", "pop rock"]),
    _track("t30", "good 4 u", "ar15", "Olivia Rodrigo", "SOUR", "2021-05-21", 178147, 89, ["pop rock", "alt pop"]),
    _track("t31", "Sunflower", "ar16", "Post Malone", "Hollywood's Bleeding", "2019-09-06", 158040, 91, ["pop rap", "melodic rap"]),
    _track("t32", "Stay", "ar16", "Post Malone", "Twelve Carat Toothache", "2022-06-03", 141806, 85, ["pop rap"]),
    _track("t33", "Say So", "ar17", "Doja Cat", "Hot Pink", "2019-11-07", 237893, 87, ["pop", "dance pop"]),
    _track("t34", "Kiss Me More", "ar17", "Doja Cat", "Planet Her", "2021-06-25", 208867, 88, ["pop", "hip hop"]),
    _track("t35", "Nights", "ar18", "Frank Ocean", "Blonde", "2016-08-20", 307400, 83, ["r&b", "alternative r&b"]),
    _track("t36", "Summertime Magic", "ar20", "Tyler, The Creator", "Flower Boy", "2017-07-21", 213920, 78, ["hip hop", "neo soul"]),
]

# ── Grouped by time_range ────────────────────────────────────────────
DEMO_TRACKS = {
    "short_term": {"items": _ALL_TRACKS[:12]},
    "medium_term": {"items": _ALL_TRACKS[:24]},
    "long_term": {"items": _ALL_TRACKS},
}

DEMO_ARTISTS = {
    "short_term": {"items": _ARTISTS[:8]},
    "medium_term": {"items": _ARTISTS[:15]},
    "long_term": {"items": _ARTISTS},
}

# ── Profile ──────────────────────────────────────────────────────────
DEMO_PROFILE = {
    "id": "demo_user",
    "display_name": "Demo Listener",
    "email": "demo@tunelytics.app",
    "images": [{"url": f"{_IMG}Demo+User", "height": 300, "width": 300}],
    "country": "US",
    "product": "premium",
    "followers": {"total": 42},
    "external_urls": {"spotify": "#"},
}

# ── Recently Played ─────────────────────────────────────────────────
DEMO_RECENTLY_PLAYED = {
    "items": [
        {"track": t, "played_at": f"2024-01-{15 - i:02d}T{10 + i}:30:00Z"}
        for i, t in enumerate(_ALL_TRACKS[:15])
    ]
}

# ── Playlists ────────────────────────────────────────────────────────
_PLAYLIST_META = [
    ("pl01", "Chill Vibes", "Relaxing tracks for winding down", 18),
    ("pl02", "Workout Energy", "High-energy tracks for the gym", 22),
    ("pl03", "Throwback Hits", "Greatest hits from decades past", 30),
    ("pl04", "Discover Weekly", "Fresh discoveries curated for you", 25),
    ("pl05", "Late Night Drive", "Atmospheric tracks for the road", 15),
]

DEMO_PLAYLISTS = {
    "items": [
        {
            "id": pid,
            "name": name,
            "description": desc,
            "images": [{"url": f"{_IMG}{name.replace(' ', '+')}", "height": 300, "width": 300}],
            "tracks": {"total": total},
            "owner": {"display_name": "Demo Listener"},
            "public": True,
            "external_urls": {"spotify": "#"},
        }
        for pid, name, desc, total in _PLAYLIST_META
    ]
}

# Playlist details map playlist_id → full playlist with tracks
DEMO_PLAYLIST_DETAILS = {}
for idx, (pid, name, desc, total) in enumerate(_PLAYLIST_META):
    # Rotate through tracks so each playlist gets a different slice
    start = (idx * 7) % len(_ALL_TRACKS)
    ptracks = (_ALL_TRACKS + _ALL_TRACKS)[start : start + min(total, len(_ALL_TRACKS))]
    DEMO_PLAYLIST_DETAILS[pid] = {
        "id": pid,
        "name": name,
        "description": desc,
        "images": [{"url": f"{_IMG}{name.replace(' ', '+')}", "height": 300, "width": 300}],
        "tracks": {
            "total": len(ptracks),
            "items": [{"track": t, "added_at": "2024-01-01T00:00:00Z"} for t in ptracks],
        },
        "owner": {"display_name": "Demo Listener"},
        "public": True,
        "external_urls": {"spotify": "#"},
    }

# ── Taste Analysis (pre-computed for demo) ───────────────────────────
DEMO_TASTE_ANALYSIS = {
    "short_term": {
        "genre_distribution": {"pop": 0.30, "canadian pop": 0.12, "electropop": 0.09, "dance pop": 0.09, "hip hop": 0.08, "indie rock": 0.07, "r&b": 0.06, "singer-songwriter": 0.05, "brit pop": 0.04, "alt pop": 0.04},
        "mainstream_score": 91.2,
        "taste_label": "Mainstream",
        "artist_diversity": 0.83,
        "top_genres": ["pop", "canadian pop", "electropop", "dance pop", "hip hop"],
    },
    "medium_term": {
        "genre_distribution": {"pop": 0.22, "hip hop": 0.11, "indie rock": 0.09, "alternative rock": 0.08, "r&b": 0.07, "canadian pop": 0.06, "classic rock": 0.05, "psychedelic pop": 0.05, "dance pop": 0.04, "reggaeton": 0.04},
        "mainstream_score": 87.5,
        "taste_label": "Mainstream",
        "artist_diversity": 0.79,
        "top_genres": ["pop", "hip hop", "indie rock", "alternative rock", "r&b"],
    },
    "long_term": {
        "genre_distribution": {"pop": 0.18, "hip hop": 0.10, "r&b": 0.09, "indie rock": 0.07, "alternative rock": 0.06, "dance pop": 0.05, "classic rock": 0.05, "reggaeton": 0.04, "neo soul": 0.04, "pop rap": 0.04},
        "mainstream_score": 86.8,
        "taste_label": "Mainstream",
        "artist_diversity": 0.75,
        "top_genres": ["pop", "hip hop", "r&b", "indie rock", "alternative rock"],
    },
}
