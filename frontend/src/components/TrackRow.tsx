import type { Track } from '../types';
import PopularityBar from './PopularityBar';

interface Props {
  track: Track;
  rank: number;
  onClick?: () => void;
}

function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export default function TrackRow({ track, rank, onClick }: Props) {
  const albumArt = track.album.images?.[0]?.url;

  return (
    <div
      onClick={onClick}
      className="flex cursor-pointer items-center gap-4 rounded-lg border border-transparent p-3 transition-colors duration-200 hover:border-[#252540] hover:bg-[#1a1a2e]"
    >
      <span className="w-6 text-right text-xs text-[#6b6b80]">{rank}</span>
      {albumArt && (
        <img
          src={albumArt}
          alt={track.album.name}
          className="h-10 w-10 rounded object-cover"
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white">
          {track.name}
        </p>
        <p className="truncate text-xs text-[#a0a0b8]">
          {track.artists.map((a) => a.name).join(', ')}
        </p>
      </div>
      <span className="hidden text-xs text-[#6b6b80] md:block">
        {track.album.name}
      </span>
      <PopularityBar value={track.popularity} />
      <span className="w-10 text-right text-xs text-[#6b6b80]">
        {formatDuration(track.duration_ms)}
      </span>
    </div>
  );
}
