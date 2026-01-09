'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function OAuthRedirect() {
  const router = useRouter();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) {
      router.push('/login');
      return;
    }

    const handleOAuthLogin = async () => {
      try {
        await loginWithToken(token);
        router.push('/');
      } catch {
        router.push('/login');
      }
    };

    handleOAuthLogin();
  }, [router, loginWithToken]);

  return  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white">
    <div className="relative flex h-16 w-16 items-center justify-center">
      {/* Outer pulse */}
      <div className="absolute h-full w-full rounded-full bg-blue-500 opacity-30 animate-ping" />

      {/* Inner circle */}
      <div className="h-6 w-6 rounded-full bg-blue-600 animate-pulse" />
    </div>

    <p className="text-sm font-medium text-gray-600 animate-pulse">
      Logging you in...
    </p>
  </div>;
}
