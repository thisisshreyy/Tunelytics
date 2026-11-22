import { useState, useEffect } from 'react';
import {
  RefreshCw,
  LogIn,
  LogOut,
  User,
  Info,
  Key,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { api } from '../services/api';
import { useApi } from '../hooks/useApi';

export default function Settings() {
  const isConnected = api.isAuthenticated();
  const { data: profile, refetch } = useApi(() => api.getProfile(), []);

  const [authConfig, setAuthConfig] = useState<{
    is_configured: boolean;
    client_id_configured: boolean;
    client_id_preview: string | null;
    redirect_uri: string;
  } | null>(null);

  const [showConfigForm, setShowConfigForm] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const currentRedirectUri = `${window.location.origin}/callback`;

  useEffect(() => {
    api
      .getAuthConfig()
      .then((cfg) => {
        setAuthConfig(cfg);
        if (!cfg.is_configured && !isConnected) {
          setShowConfigForm(true);
        }
      })
      .catch(() => {});
  }, [isConnected]);

  const handleCopyUri = () => {
    navigator.clipboard.writeText(currentRedirectUri);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus(null);
    setConnectError(null);
    try {
      await api.saveAuthConfig({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: currentRedirectUri,
      });
      setSaveStatus('Credentials saved successfully! Connecting...');
      const cfg = await api.getAuthConfig();
      setAuthConfig(cfg);
      setClientId('');
      setClientSecret('');
      // Immediately initiate login
      setTimeout(() => {
        handleConnect();
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save configuration';
      setConnectError(msg);
    }
  };

  const handleConnect = async () => {
    setConnectError(null);
    setConnecting(true);
    try {
      await api.login(currentRedirectUri);
    } catch (err: unknown) {
      setConnecting(false);
      const msg = err instanceof Error ? err.message : 'Failed to start Spotify authentication';
      setConnectError(msg);
      if (!authConfig?.is_configured) {
        setShowConfigForm(true);
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      {/* Error alert banner */}
      {connectError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-400" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Connection Error</p>
            <p className="mt-0.5 text-xs text-red-300/90">{connectError}</p>
          </div>
        </div>
      )}

      {/* Connected Account Card */}
      <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-6">
        <h2 className="mb-4 text-sm font-semibold text-[#a0a0b8]">
          Spotify Account
        </h2>
        {isConnected && profile ? (
          <div className="flex items-center gap-4">
            {profile.images?.[0]?.url ? (
              <img
                src={profile.images[0].url}
                alt={profile.display_name}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-500 text-lg font-semibold">
                {profile.display_name?.[0]?.toUpperCase() ?? '?'}
              </div>
            )}
            <div>
              <p className="font-semibold">{profile.display_name}</p>
              <p className="text-sm text-[#a0a0b8]">{profile.email}</p>
              <p className="text-xs text-[#6b6b80]">
                {profile.product} • {profile.country}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-[#a0a0b8]">
            <User size={20} />
            <span className="text-sm">Not connected — using demo data</span>
          </div>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          {isConnected ? (
            <button
              onClick={() => api.logout()}
              className="flex items-center gap-2 rounded-lg bg-red-500/15 px-4 py-2 text-xs font-semibold text-red-400 transition-colors duration-200 hover:bg-red-500/25"
            >
              <LogOut size={14} />
              Disconnect Account
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={connecting}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-green-500 disabled:opacity-50"
            >
              <LogIn size={14} />
              {connecting ? 'Redirecting to Spotify...' : 'Connect Spotify'}
            </button>
          )}

          {!isConnected && (
            <button
              onClick={() => setShowConfigForm(!showConfigForm)}
              className="flex items-center gap-1.5 rounded-lg border border-[#252540] bg-[#13131d] px-3.5 py-2 text-xs font-medium text-[#a0a0b8] transition-colors duration-200 hover:text-white"
            >
              <Key size={13} />
              {authConfig?.is_configured ? 'Edit Spotify API Keys' : 'Configure Spotify Credentials'}
              {showConfigForm ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
          )}
        </div>
      </div>

      {/* Spotify Credentials Configuration Panel */}
      {(!isConnected && showConfigForm) && (
        <div className="rounded-xl border border-purple-500/30 bg-[#161626] p-6 shadow-lg">
          <div className="mb-4 flex items-center gap-2">
            <Key size={18} className="text-purple-400" />
            <h2 className="text-sm font-semibold text-white">
              Spotify API Setup Guide
            </h2>
          </div>

          <div className="mb-5 space-y-2 rounded-lg bg-[#0d0d14] p-4 text-xs text-[#a0a0b8]">
            <p className="font-semibold text-white">3 Quick Steps to Connect:</p>
            <ol className="list-decimal space-y-1.5 pl-4 text-xs">
              <li>
                Open the{' '}
                <a
                  href="https://developer.spotify.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-400 hover:underline"
                >
                  Spotify Developer Dashboard <ExternalLink size={10} />
                </a>{' '}
                and click <strong>Create app</strong>.
              </li>
              <li>
                In your app's <strong>Settings</strong>, add this exact Redirect URI:
                <div className="mt-1 flex items-center gap-2">
                  <code className="rounded bg-[#1a1a2e] px-2 py-1 text-purple-300 font-mono">
                    {currentRedirectUri}
                  </code>
                  <button
                    onClick={handleCopyUri}
                    type="button"
                    className="flex items-center gap-1 rounded bg-[#252540] px-2 py-1 text-[11px] text-white hover:bg-purple-600 transition-colors"
                  >
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </li>
              <li>
                Under <strong>User Management</strong> in Spotify's dashboard, add your personal Spotify account email (required in Spotify Development Mode).
              </li>
            </ol>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#a0a0b8] mb-1">
                Spotify Client ID
              </label>
              <input
                type="text"
                required
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder={authConfig?.client_id_preview ? `Current: ${authConfig.client_id_preview}` : 'Paste 32-character Client ID'}
                className="w-full rounded-lg border border-[#252540] bg-[#13131d] px-3.5 py-2 text-sm text-white placeholder-[#6b6b80] outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#a0a0b8] mb-1">
                Spotify Client Secret
              </label>
              <input
                type="password"
                required
                value={clientSecret}
                onChange={(e) => setClientSecret(e.target.value)}
                placeholder="Paste Client Secret"
                className="w-full rounded-lg border border-[#252540] bg-[#13131d] px-3.5 py-2 text-sm text-white placeholder-[#6b6b80] outline-none focus:border-purple-500 font-mono"
              />
            </div>

            {saveStatus && (
              <p className="text-xs text-green-400">{saveStatus}</p>
            )}

            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                className="rounded-lg bg-purple-600 px-4 py-2 text-xs font-semibold text-white transition-colors duration-200 hover:bg-purple-500"
              >
                Save & Connect Spotify
              </button>
              <button
                type="button"
                onClick={() => setShowConfigForm(false)}
                className="rounded-lg border border-[#252540] bg-[#13131d] px-4 py-2 text-xs text-[#a0a0b8] transition-colors duration-200 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Mode Card */}
      <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-6">
        <h2 className="mb-2 text-sm font-semibold text-[#a0a0b8]">
          Data Mode
        </h2>
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-amber-400'}`}
          />
          <span className="text-sm text-white">
            {isConnected ? 'Live Spotify Data' : 'Demo Mode'}
          </span>
        </div>
        <p className="mt-1 text-xs text-[#6b6b80]">
          {isConnected
            ? 'Connected to Spotify API. Displaying your real music analytics.'
            : 'Displaying realistic sample listening data. Connect Spotify above to see your personal stats.'}
        </p>
      </div>

      {/* Refresh Data */}
      <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-6">
        <h2 className="mb-2 text-sm font-semibold text-[#a0a0b8]">
          Data Refresh
        </h2>
        <button
          onClick={() => {
            refetch();
            window.location.reload();
          }}
          className="flex items-center gap-2 rounded-lg bg-purple-500/15 px-4 py-2 text-xs font-semibold text-purple-400 transition-colors duration-200 hover:bg-purple-500/25"
        >
          <RefreshCw size={14} />
          Refresh All Data
        </button>
      </div>

      {/* App Info */}
      <div className="rounded-xl border border-[#252540] bg-[#1a1a2e] p-6">
        <h2 className="mb-2 text-sm font-semibold text-[#a0a0b8]">About</h2>
        <div className="flex items-start gap-2 text-sm text-[#a0a0b8]">
          <Info size={16} className="mt-0.5 shrink-0 text-purple-400" />
          <div>
            <p className="font-semibold text-white">Tunelytics</p>
            <p className="text-xs text-[#6b6b80]">
              Personal Music Analytics Dashboard
            </p>
            <p className="mt-1 text-xs text-[#6b6b80]">
              Frontend: React 19, TypeScript, Tailwind CSS, Recharts
              <br />
              Backend: FastAPI, SQLAlchemy, SQLite, Spotify OAuth 2.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
