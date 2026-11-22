import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import type { TimeRange, Track } from '../types';
import TimeRangeSelector from '../components/TimeRangeSelector';
import TrackRow from '../components/TrackRow';
import PopularityBar from '../components/PopularityBar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import DemoBanner from '../components/DemoBanner';

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function Tracks() {
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Track | null>(null);
  const [page, setPage] = useState(0);
  const isDemo = !api.isAuthenticated();
  const pageSize = 20;

  const { data, loading, error, refetch } = useApi(
    () => api.getTopTracks(timeRange),
    [timeRange],
  );

  const filtered = useMemo(() => {
    if (!data?.items) return [];
    if (!search.trim()) return data.items;
    const q = search.toLowerCase();
    return data.items.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.artists.some((a) => a.name.toLowerCase().includes(q)) ||
        t.album.name.toLowerCase().includes(q),
    );
  }, [data, search]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {isDemo && <DemoBanner />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Top Tracks</h1>
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
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          placeholder="Search tracks, artists, albums…"
          className="w-full rounded-lg border border-[#252540] bg-[#1a1a2e] py-2 pl-9 pr-3 text-sm text-white placeholder-[#6b6b80] outline-none focus:border-purple-500"
        />
      </div>

      {/* Track list */}
      <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-2">
        {paged.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#6b6b80]">
            No tracks found
          </p>
        ) : (
          paged.map((track, i) => (
            <TrackRow
              key={track.id}
              track={track}
              rank={page * pageSize + i + 1}
              onClick={() => setSelected(track)}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`h-8 w-8 rounded-lg text-xs transition-colors duration-200 ${
                page === i
                  ? 'bg-purple-500 text-white'
                  : 'bg-[#1a1a2e] text-[#a0a0b8] hover:text-white'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative max-w-md w-full rounded-xl border border-[#252540] bg-[#13131d] p-6">
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 text-[#6b6b80] hover:text-white"
            >
              <X size={20} />
            </button>
            {selected.album.images?.[0]?.url && (
              <img
                src={selected.album.images[0].url}
                alt={selected.album.name}
                className="mx-auto mb-4 h-48 w-48 rounded-lg object-cover"
              />
            )}
            <h2 className="text-lg font-semibold">{selected.name}</h2>
            <p className="text-sm text-[#a0a0b8]">
              {selected.artists.map((a) => a.name).join(', ')}
            </p>
            <p className="mt-1 text-xs text-[#6b6b80]">
              {selected.album.name} • {selected.album.release_date}
            </p>
            <div className="mt-4 flex items-center gap-4">
              <div>
                <span className="text-xs text-[#6b6b80]">Popularity</span>
                <div className="mt-1 flex items-center gap-2">
                  <PopularityBar value={selected.popularity} />
                  <span className="text-xs text-[#a0a0b8]">
                    {selected.popularity}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-xs text-[#6b6b80]">Duration</span>
                <p className="mt-1 text-sm text-white">
                  {formatDuration(selected.duration_ms)}
                </p>
              </div>
            </div>
            {selected.external_urls.spotify &&
              selected.external_urls.spotify !== '#' && (
                <a
                  href={selected.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-500"
                >
                  Open in Spotify
                </a>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
