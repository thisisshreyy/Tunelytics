interface Props {
  value: number;
}

export default function PopularityBar({ value }: Props) {
  return (
    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#252540]">
      <div
        className="h-full rounded-full bg-purple-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
