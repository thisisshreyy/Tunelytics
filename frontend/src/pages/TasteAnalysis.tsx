import { useState } from 'react';
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
import type { TimeRange } from '../types';
import TimeRangeSelector from '../components/TimeRangeSelector';
import GenreTag from '../components/GenreTag';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import DemoBanner from '../components/DemoBanner';

const BAR_COLORS = [
  '#8b5cf6',
  '#a78bfa',
  '#7c3aed',
  '#6d28d9',
  '#c4b5fd',
  '#5b21b6',
  '#ddd6fe',
  '#4c1d95',
];

export default function TasteAnalysis() {
  const [timeRange, setTimeRange] = useState<TimeRange>('medium_term');
  const isDemo = !api.isAuthenticated();

  const { data, loading, error, refetch } = useApi(
    () => api.getTasteAnalysis(timeRange),
    [timeRange],
  );

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={refetch} />;
  if (!data) return null;

  const genreChartData = Object.entries(data.genre_distribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({ name, value }));

  const scoreColor =
    data.mainstream_score >= 70
      ? '#22c55e'
      : data.mainstream_score >= 40
        ? '#f59e0b'
        : '#8b5cf6';

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {isDemo && <DemoBanner />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Taste Analysis</h1>
        <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
      </div>

      {/* Mainstream Score Gauge */}
      <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-6">
        <h2 className="mb-4 text-sm font-semibold text-[#a0a0b8]">
          Mainstream Score
        </h2>
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex h-32 w-32 items-center justify-center">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="#252540"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(data.mainstream_score / 100) * 314} 314`}
              />
            </svg>
            <span className="absolute text-2xl font-semibold text-white">
              {Math.round(data.mainstream_score)}
            </span>
          </div>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: `${scoreColor}20`,
              color: scoreColor,
            }}
          >
            {data.taste_label}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Genre Distribution */}
        <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-4">
          <h2 className="mb-4 text-sm font-semibold text-[#a0a0b8]">
            Genre Distribution
          </h2>
          {genreChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={genreChartData}
                layout="vertical"
                margin={{ left: 80 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#a0a0b8', fontSize: 12 }}
                  width={80}
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
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {genreChartData.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill={BAR_COLORS[idx % BAR_COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-10 text-center text-xs text-[#6b6b80]">
              No genre data
            </p>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Artist Diversity */}
          <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-4">
            <h2 className="mb-2 text-sm font-semibold text-[#a0a0b8]">
              Artist Diversity
            </h2>
            <div className="flex items-center gap-4">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#252540]">
                <div
                  className="h-full rounded-full bg-purple-500"
                  style={{ width: `${data.artist_diversity * 100}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-white">
                {Math.round(data.artist_diversity * 100)}%
              </span>
            </div>
          </div>

          {/* Top Genres */}
          <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-4">
            <h2 className="mb-3 text-sm font-semibold text-[#a0a0b8]">
              Top Genres
            </h2>
            <div className="flex flex-wrap gap-2">
              {data.top_genres.map((g) => (
                <GenreTag key={g} genre={g} />
              ))}
            </div>
          </div>

          {/* Taste Summary */}
          <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-4">
            <h2 className="mb-2 text-sm font-semibold text-[#a0a0b8]">
              Your Taste Profile
            </h2>
            <p className="text-sm text-white">
              {data.mainstream_score >= 70
                ? 'You tend towards popular, well-known tracks. Your taste aligns with mainstream trends and chart-toppers.'
                : data.mainstream_score >= 40
                  ? 'You have a balanced taste, mixing popular hits with hidden gems. You appreciate both mainstream and indie music.'
                  : 'You lean towards underground and niche music. Your listening habits favor lesser-known artists and unique sounds.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
