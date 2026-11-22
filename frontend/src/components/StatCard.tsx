import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
}

export default function StatCard({ icon: Icon, label, value }: Props) {
  return (
    <div className="rounded-lg border border-[#252540] bg-[#1a1a2e] p-4">
      <div className="mb-2 flex items-center gap-2 text-[#6b6b80]">
        <Icon size={16} />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
