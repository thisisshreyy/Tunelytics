interface Props {
  genre: string;
}

export default function GenreTag({ genre }: Props) {
  return (
    <span className="inline-block rounded-full bg-purple-500/15 px-2.5 py-0.5 text-xs text-purple-400">
      {genre}
    </span>
  );
}
