'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');

    if (accessToken && refreshToken) {
      // Store tokens in localStorage (or secure cookies if possible)
      localStorage.setItem('directus_access_token', accessToken);
      localStorage.setItem('directus_refresh_token', refreshToken);
      router.push('/'); // Redirect to home page
    } else {
      console.error('Tokens not found in URL');
      router.push('/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Logging you in...</p>
    </div>
  );
}
