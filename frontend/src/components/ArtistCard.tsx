import type { Artist } from '../types';
import GenreTag from './GenreTag';

interface Props {
  artist: Artist;
  onClick?: () => void;
}

export default function ArtistCard({ artist, onClick }: Props) {
  const img = artist.images?.[0]?.url;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-[#252540] bg-[#1a1a2e] p-4 transition-colors duration-200 hover:border-purple-500/40"
    >
      <div className="mx-auto mb-3 h-28 w-28 overflow-hidden rounded-full">
        {img ? (
          <img
            src={img}
            alt={artist.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#252540] text-2xl text-[#6b6b80]">
            {artist.name[0]}
          </div>
        )}
      </div>
      <h3 className="truncate text-center text-sm font-semibold text-white">
        {artist.name}
      </h3>
      <div className="mt-2 flex flex-wrap justify-center gap-1">
        {artist.genres.slice(0, 2).map((g) => (
          <GenreTag key={g} genre={g} />
        ))}
      </div>
    </div>
  );
}
