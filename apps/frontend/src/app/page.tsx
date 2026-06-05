'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const { user, token, hydrateSession } = useAuthStore();
  const [isChecking, setIsChecking] = useState(Boolean(token));

  useEffect(() => {
    let isMounted = true;

    const resolveSession = async () => {
      if (!token) {
        return;
      }

      if (!user) {
        setIsChecking(true);
        const hydratedUser = await hydrateSession();
        if (!isMounted) {
          return;
        }

        if (!hydratedUser) {
          setIsChecking(false);
          return;
        }
      }

      router.replace('/dashboard');
    };

    void resolveSession();

    return () => {
      isMounted = false;
    };
  }, [user, token, hydrateSession, router]);

  if (isChecking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <p className="text-gray-600">Restoring your session...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Lawyered Will Maker
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Create your will with AI assistance. Fast, simple, and secure.
        </p>

        {!user ? (
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => router.push('/auth/login')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/auth/register')}
              className="bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-3 px-8 rounded-lg transition"
            >
              Sign Up
            </button>
          </div>
        ) : (
          <button
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition"
          >
            Go to Dashboard
          </button>
        )}

        {/* Features Preview */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-2">🤖</div>
            <h3 className="font-semibold text-gray-900 mb-2">AI Powered</h3>
            <p className="text-gray-600">
              Let AI guide you through the will creation process
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
            <p className="text-gray-600">
              Your data is encrypted and protected
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Fast</h3>
            <p className="text-gray-600">
              Complete your will in minutes, not hours
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
