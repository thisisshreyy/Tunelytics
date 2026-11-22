import { useState, useMemo } from 'react';
import { ArrowLeft, Clock, Flame, ListMusic } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';
import type { PlaylistDetail, Track } from '../types';
import PlaylistCard from '../components/PlaylistCard';
import TrackRow from '../components/TrackRow';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import DemoBanner from '../components/DemoBanner';

const BAR_COLORS = ['#8b5cf6', '#a78bfa', '#7c3aed', '#6d28d9', '#c4b5fd'];

function formatTotalDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours} hr ${minutes} min`;
  }
  return `${minutes} min`;
}

export default function Playlists() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isDemo = !api.isAuthenticated();

  const { data, loading, error, refetch } = useApi(
    () => api.getPlaylists(),
    [],
  );

  const {
    data: detail,
    loading: dLoading,
    error: dError,
  } = useApi(
    () =>
      selectedId
        ? api.getPlaylistDetail(selectedId)
        : Promise.resolve(null as unknown as PlaylistDetail),
    [selectedId],
  );

  const tracks: Track[] = useMemo(() => {
    return detail?.tracks?.items?.map((item) => item.track) ?? [];
  }, [detail]);

  const analysis = useMemo(() => {
    if (!tracks.length) return null;

    const totalPop = tracks.reduce((acc, t) => acc + (t.popularity ?? 0), 0);
    const avgPopularity = Math.round(totalPop / tracks.length);
    const totalDuration = tracks.reduce((acc, t) => acc + (t.duration_ms ?? 0), 0);

    const decadeCounts: Record<string, number> = {};
    tracks.forEach((t) => {
      const yearStr = t.album?.release_date?.slice(0, 4);
      if (yearStr && !isNaN(Number(yearStr))) {
        const year = Number(yearStr);
        const decade = `${Math.floor(year / 10) * 10}s`;
        decadeCounts[decade] = (decadeCounts[decade] || 0) + 1;
      }
    });

    const decadeChartData = Object.entries(decadeCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      avgPopularity,
      totalDuration,
      decadeChartData,
    };
  }, [tracks]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;

  if (selectedId && detail) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <button
          onClick={() => setSelectedId(null)}
          className="flex items-center gap-2 text-sm text-[#a0a0b8] transition-colors duration-200 hover:text-white"
        >
          <ArrowLeft size={16} />
          Back to Playlists
        </button>

        <div className="flex flex-col gap-6 md:flex-row md:items-end">
          {detail.images?.[0]?.url && (
            <img
              src={detail.images[0].url}
              alt={detail.name}
              className="h-44 w-44 shrink-0 rounded-xl object-cover shadow-lg"
            />
          )}
          <div className="flex-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
              Playlist
            </span>
            <h1 className="mt-1 text-3xl font-bold">{detail.name}</h1>
            {detail.description && (
              <p className="mt-2 text-sm text-[#a0a0b8]">
                {detail.description}
              </p>
            )}
            <p className="mt-3 text-xs text-[#6b6b80]">
              {detail.owner.display_name} • {tracks.length} tracks
            </p>
          </div>
        </div>

        {analysis && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard
              icon={ListMusic}
              label="Track Count"
              value={tracks.length}
            />
            <StatCard
              icon={Flame}
              label="Avg Popularity"
              value={`${analysis.avgPopularity} / 100`}
            />
            <StatCard
              icon={Clock}
              label="Total Length"
              value={formatTotalDuration(analysis.totalDuration)}
            />
          </div>
        )}

        {analysis && analysis.decadeChartData.length > 0 && (
          <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-5">
            <h2 className="mb-4 text-sm font-semibold text-[#a0a0b8]">
              Release Era Breakdown
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analysis.decadeChartData}>
                <XAxis
                  dataKey="name"
                  stroke="#6b6b80"
                  tick={{ fill: '#a0a0b8', fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#6b6b80"
                  tick={{ fill: '#a0a0b8', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    background: '#1a1a2e',
                    border: '1px solid #252540',
                    borderRadius: 8,
                    color: '#fff',
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {analysis.decadeChartData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={BAR_COLORS[idx % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-3">
          <h2 className="mb-3 px-3 pt-2 text-sm font-semibold text-[#a0a0b8]">
            Tracks
          </h2>
          {tracks.map((track, i) => (
            <TrackRow key={`${track.id}-${i}`} track={track} rank={i + 1} />
          ))}
        </div>
      </div>
    );
  }

  if (selectedId && dLoading) return <LoadingSpinner />;
  if (selectedId && dError)
    return (
      <ErrorMessage
        message={dError}
        onRetry={() => setSelectedId(selectedId)}
      />
    );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {isDemo && <DemoBanner />}

      <h1 className="text-2xl font-semibold">Playlists</h1>

      {!data?.items?.length ? (
        <p className="py-10 text-center text-sm text-[#6b6b80]">
          No playlists found
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {data.items.map((p) => (
            <PlaylistCard
              key={p.id}
              playlist={p}
              onClick={() => setSelectedId(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
