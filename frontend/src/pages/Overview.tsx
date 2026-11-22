import { useState } from 'react';
import { Music2, Mic2, TrendingUp, Shuffle } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import type { TimeRange } from '../types';
import TimeRangeSelector from '../components/TimeRangeSelector';
import StatCard from '../components/StatCard';
import TrackRow from '../components/TrackRow';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import DemoBanner from '../components/DemoBanner';

const PIE_COLORS = [
  '#8b5cf6',
  '#a78bfa',
  '#7c3aed',
  '#6d28d9',
  '#c4b5fd',
  '#5b21b6',
  '#ddd6fe',
  '#4c1d95',
];

export default function Overview() {
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const isDemo = !api.isAuthenticated();

  const { data: profile, loading: pLoading } = useApi(
    () => api.getProfile(),
    [],
  );
  const {
    data: tracks,
    loading: tLoading,
    error: tError,
    refetch: tRefetch,
  } = useApi(() => api.getTopTracks(timeRange), [timeRange]);
  const {
    data: artists,
    loading: aLoading,
    error: aError,
    refetch: aRefetch,
  } = useApi(() => api.getTopArtists(timeRange), [timeRange]);
  const { data: recent } = useApi(() => api.getRecentlyPlayed(), []);
  const { data: taste } = useApi(
    () => api.getTasteAnalysis(timeRange),
    [timeRange],
  );

  const loading = pLoading || tLoading || aLoading;
  const error = tError || aError;

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <ErrorMessage
        message={error}
        onRetry={() => {
          tRefetch();
          aRefetch();
        }}
      />
    );

  const topGenres = taste?.top_genres ?? [];
  const genreChartData = taste
    ? Object.entries(taste.genre_distribution)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 8)
        .map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {isDemo && <DemoBanner />}

      {/* Welcome */}
      <div className="flex items-center gap-4">
        {profile?.images?.[0]?.url ? (
          <img
            src={profile.images[0].url}
            alt={profile.display_name}
            className="h-14 w-14 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500 text-xl font-semibold">
            {profile?.display_name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold">
            Welcome, {profile?.display_name ?? 'Music Lover'}
          </h1>
          <p className="text-sm text-[#a0a0b8]">
            Here&apos;s your listening overview
          </p>
        </div>
      </div>

      {/* Time range */}
      <TimeRangeSelector value={timeRange} onChange={setTimeRange} />

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard
          icon={Music2}
          label="Top Tracks"
          value={tracks?.items.length ?? 0}
        />
        <StatCard
          icon={Mic2}
          label="Top Genre"
          value={topGenres[0] ?? '—'}
        />
        <StatCard
          icon={TrendingUp}
          label="Mainstream Score"
          value={taste ? `${Math.round(taste.mainstream_score)}%` : '—'}
        />
        <StatCard
          icon={Shuffle}
          label="Diversity"
          value={taste ? `${Math.round(taste.artist_diversity * 100)}%` : '—'}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top 5 Tracks */}
        <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-4">
          <h2 className="mb-3 text-sm font-semibold text-[#a0a0b8]">
            Top Tracks
          </h2>
          {tracks?.items.slice(0, 5).map((track, i) => (
            <TrackRow key={track.id} track={track} rank={i + 1} />
          ))}
        </div>

        {/* Top 5 Artists */}
        <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-4">
          <h2 className="mb-3 text-sm font-semibold text-[#a0a0b8]">
            Top Artists
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {artists?.items.slice(0, 5).map((artist) => {
              const img = artist.images?.[0]?.url;
              return (
                <div
                  key={artist.id}
                  className="flex shrink-0 flex-col items-center gap-2"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-full">
                    {img ? (
                      <img
                        src={img}
                        alt={artist.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[#252540] text-sm text-[#6b6b80]">
                        {artist.name[0]}
                      </div>
                    )}
                  </div>
                  <span className="max-w-[80px] truncate text-xs text-white">
                    {artist.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recently Played */}
        <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-4">
          <h2 className="mb-3 text-sm font-semibold text-[#a0a0b8]">
            Recently Played
          </h2>
          <div className="space-y-2">
            {recent?.items.slice(0, 8).map((item, i) => (
              <div
                key={`${item.track.id}-${i}`}
                className="flex items-center gap-3"
              >
                {item.track.album.images?.[0]?.url && (
                  <img
                    src={item.track.album.images[0].url}
                    alt=""
                    className="h-8 w-8 rounded object-cover"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-white">
                    {item.track.name}
                  </p>
                  <p className="truncate text-xs text-[#6b6b80]">
                    {item.track.artists.map((a) => a.name).join(', ')}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-[#6b6b80]">
                  {new Date(item.played_at).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Genre Distribution */}
        <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-4">
          <h2 className="mb-3 text-sm font-semibold text-[#a0a0b8]">
            Genre Distribution
          </h2>
          {genreChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={genreChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {genreChartData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={PIE_COLORS[idx % PIE_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#1a1a2e',
                    border: '1px solid #252540',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-xs text-[#6b6b80]">
              No genre data available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
