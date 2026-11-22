import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import type { TimeRange, Artist } from '../types';
import TimeRangeSelector from '../components/TimeRangeSelector';
import ArtistCard from '../components/ArtistCard';
import GenreTag from '../components/GenreTag';
import PopularityBar from '../components/PopularityBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import DemoBanner from '../components/DemoBanner';

export default function Artists() {
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Artist | null>(null);
  const isDemo = !api.isAuthenticated();

  const { data, loading, error, refetch } = useApi(
    () => api.getTopArtists(timeRange),
    [timeRange],
  );

  const filtered = useMemo(() => {
    if (!data?.items) return [];
    if (!search.trim()) return data.items;
    const q = search.toLowerCase();
    return data.items.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.genres.some((g) => g.toLowerCase().includes(q)),
    );
  }, [data, search]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {isDemo && <DemoBanner />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Top Artists</h1>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b6b80]"
        />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search artists, genres…"
          className="w-full rounded-lg border border-[#252540] bg-[#1a1a2e] py-2 pl-9 pr-3 text-sm text-white placeholder-[#6b6b80] outline-none focus:border-purple-500"
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-10 text-center text-sm text-[#6b6b80]">
          No artists found
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filtered.map((artist) => (
            <ArtistCard
              key={artist.id}
              artist={artist}
              onClick={() => setSelected(artist)}
            />
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-md rounded-xl border border-[#252540] bg-[#13131d] p-6">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 text-[#6b6b80] hover:text-white"
            >
              <X size={20} />
            </button>
            <div className="mx-auto mb-4 h-40 w-40 overflow-hidden rounded-full">
              {selected.images?.[0]?.url ? (
                <img
                  src={selected.images[0].url}
                  alt={selected.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#252540] text-3xl text-[#6b6b80]">
                  {selected.name[0]}
                </div>
              )}
            </div>
            <h2 className="text-center text-lg font-semibold">
              {selected.name}
            </h2>
            <div className="mt-3 flex flex-wrap justify-center gap-1">
              {selected.genres.map((g) => (
                <GenreTag key={g} genre={g} />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 text-center">
              <div>
                <span className="text-xs text-[#6b6b80]">Popularity</span>
                <div className="mt-1 flex items-center justify-center gap-2">
                  <PopularityBar value={selected.popularity} />
                  <span className="text-xs text-[#a0a0b8]">
                    {selected.popularity}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs text-[#6b6b80]">Followers</span>
                <p className="mt-1 text-sm text-white">
                  {selected.followers.total.toLocaleString()}
                </p>
              </div>
            </div>
            {selected.external_urls.spotify &&
              selected.external_urls.spotify !== '#' && (
                <div className="mt-4 text-center">
                  <a
                    href={selected.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-500"
                  >
                    Open in Spotify
                  </a>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
