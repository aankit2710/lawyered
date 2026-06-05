'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { token, user, hydrateSession } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      if (!token) {
        router.replace('/auth/login');
        if (isMounted) {
          setIsChecking(false);
        }
        return;
      }

      if (user) {
        if (isMounted) {
          setIsChecking(false);
        }
        return;
      }

      const hydratedUser = await hydrateSession();
      if (!isMounted) {
        return;
      }

      if (!hydratedUser) {
        router.replace('/auth/login');
        return;
      }

      setIsChecking(false);
    };

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, [token, user, hydrateSession, router]);

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
