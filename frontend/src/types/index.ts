export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface Artist {
  id: string;
  name: string;
  images: SpotifyImage[];
  genres: string[];
  popularity: number;
  followers: { total: number };
  external_urls: { spotify: string };
}

export interface Album {
  id: string;
  name: string;
  images: SpotifyImage[];
  release_date: string;
}

export interface Track {
  id: string;
  name: string;
  artists: { id: string; name: string }[];
  album: Album;
  duration_ms: number;
  popularity: number;
  external_urls: { spotify: string };
}

export interface RecentlyPlayed {
  track: Track;
  played_at: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  tracks: { total: number };
  owner: { display_name: string };
  external_urls: { spotify: string };
}

export interface PlaylistDetail extends Omit<Playlist, 'tracks'> {
  tracks: { total: number; items: { track: Track }[] };
}

export interface UserProfile {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  followers: { total: number };
  country: string;
  product: string;
}

export interface TasteAnalysis {
  genre_distribution: Record<string, number>;
  mainstream_score: number;
  taste_label: string;
  artist_diversity: number;
  top_genres: string[];
}

export interface PlaylistAnalysis {
  avg_popularity: number;
  genre_breakdown: Record<string, number>;
  decade_breakdown: Record<string, number>;
  total_duration_ms: number;
}

export type TimeRange = 'short_term' | 'medium_term' | 'long_term';
