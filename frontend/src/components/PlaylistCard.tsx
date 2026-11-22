import type { Playlist } from '../types';

interface Props {
  playlist: Playlist;
  onClick?: () => void;
}

export default function PlaylistCard({ playlist, onClick }: Props) {
  const img = playlist.images?.[0]?.url;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-[#252540] bg-[#1a1a2e] p-4 transition-colors duration-200 hover:border-purple-500/40"
    >
      <div className="mb-3 aspect-square overflow-hidden rounded-lg">
        {img ? (
          <img
            src={img}
            alt={playlist.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#252540] text-2xl text-[#6b6b80]">
            ♪
          </div>
        )}
      </div>
      <h3 className="truncate text-sm font-semibold text-white">
        {playlist.name}
      </h3>
      <p className="text-xs text-[#a0a0b8]">
        {playlist.tracks.total} tracks • {playlist.owner.display_name}
      </p>
    </div>
  );
}
