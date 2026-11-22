import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Callback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  const [asyncError, setAsyncError] = useState<string | null>(null);
  const error = errorParam
    ? `Spotify authorization denied (${errorParam})`
    : (!code || !state ? 'Missing authorization parameters' : asyncError);

  useEffect(() => {
    if (!code || !state || errorParam) return;

    api
      .handleCallback(code, state)
      .then(() => {
        navigate('/', { replace: true });
      })
      .catch((err: Error) => {
        setAsyncError(err.message);
      });
  }, [code, state, errorParam, navigate]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0d0d14] px-4 text-center">
        <div className="max-w-md rounded-2xl border border-[#252540] bg-[#1a1a2e] p-8 shadow-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-red-400">
            ✕
          </div>
          <h2 className="mb-2 text-xl font-bold text-white">
            Connection Failed
          </h2>
          <p className="mb-6 text-sm text-red-400">{error}</p>
          <div className="space-y-3">
            <a
              href="/settings"
              className="block w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-purple-500"
            >
              Go to Settings & Check Credentials
            </a>
            <a
              href="/"
              className="block w-full rounded-lg border border-[#252540] bg-[#13131d] px-4 py-2.5 text-sm text-[#a0a0b8] transition-colors duration-200 hover:text-white"
            >
              Continue in Demo Mode
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#0d0d14]">
      <LoadingSpinner />
      <p className="mt-4 text-sm text-[#a0a0b8]">
        Connecting your Spotify account…
      </p>
    </div>
  );
}
