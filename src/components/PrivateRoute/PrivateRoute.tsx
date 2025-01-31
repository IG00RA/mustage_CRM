'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode, useState } from 'react';

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const user = useAuthStore(state => state.user);
  const router = useRouter();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Zustand's `persist` middleware should hydrate the store asynchronously.
    const checkUser = () => {
      if (user === null && typeof window !== 'undefined') {
        // Check localStorage directly if Zustand store is empty
        const localStorageUser = localStorage.getItem('auth-storage');
        const parsedUser = localStorageUser
          ? JSON.parse(localStorageUser).user
          : null;

        // If we find the user in localStorage, we manually set it in Zustand
        if (parsedUser) {
          useAuthStore.setState({ user: parsedUser });
        }
      }
      setIsHydrated(true);
    };

    checkUser();
  }, [user]);

  if (!isHydrated) return null;

  // If no user is found, redirect to login page
  if (!user) {
    router.push('/ru/login');
    return null;
  }

  return <>{children}</>;
}
