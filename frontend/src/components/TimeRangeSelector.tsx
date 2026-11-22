import type { TimeRange } from '../types';

const labels: Record<TimeRange, string> = {
  short_term: '4 Weeks',
  medium_term: '6 Months',
  long_term: 'All Time',
};

interface Props {
  value: TimeRange;
  onChange: (v: TimeRange) => void;
}

const ranges: TimeRange[] = ['short_term', 'medium_term', 'long_term'];

export default function TimeRangeSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-lg bg-[#1a1a2e] p-1">
      {ranges.map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors duration-200 ${
            value === r
              ? 'bg-purple-500 text-white'
              : 'text-[#a0a0b8] hover:text-white'
          }`}
        >
          {labels[r]}
        </button>
      ))}
    </div>
  );
}
