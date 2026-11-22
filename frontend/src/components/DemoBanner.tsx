import { Info } from 'lucide-react';

export default function DemoBanner() {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5">
      <Info size={16} className="shrink-0 text-amber-400" />
      <p className="text-xs text-amber-200">
        You&apos;re viewing demo data. Connect your Spotify account in{' '}
        <a href="/settings" className="underline hover:text-white">
          Settings
        </a>{' '}
        for personal analytics.
      </p>
    </div>
  );
}
