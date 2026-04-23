'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function OAuthRedirect() {
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const didRun = useRef(false);
  const [status, setStatus] = useState<'loading' | 'error'>('loading');

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    const params = new URLSearchParams(window.location.search);
    const rawToken = params.get('token');

    const token = rawToken ? decodeURIComponent(rawToken) : null;
    console.log('🔍 Extracted token:', token);

    if (!token) {
      router.replace('/login');
      return;
    }

    (async () => {
      try {
        setStatus('loading');

        await loginWithToken(token);

        // ✅ remove token from URL for security
        window.history.replaceState({}, document.title, '/oauth');

        router.replace('/');
      } catch (err) {
        console.error('OAuth login failed:', err);
        setStatus('error');

        setTimeout(() => {
          router.replace('/login');
        }, 1000);
      }
    })();
  }, [router, loginWithToken]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
      {status === 'loading' && (
        <>
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute h-full w-full rounded-full bg-blue-500 opacity-30 animate-ping" />
            <div className="h-6 w-6 rounded-full bg-blue-600 animate-pulse" />
          </div>

          <p className="text-sm font-medium text-gray-600 animate-pulse">
            Logging you in...
          </p>
        </>
      )}

      {status === 'error' && (
        <p className="text-sm font-medium text-red-500">
          Login failed. Redirecting...
        </p>
      )}
    </div>
  );
}