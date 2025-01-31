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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = () => {
      if (!user) {
        const localStorageUser = localStorage.getItem('auth-storage');
        const parsedUser = localStorageUser
          ? JSON.parse(localStorageUser).state.user
          : null;

        if (parsedUser) {
          useAuthStore.setState({ user: parsedUser });
        } else {
          router.replace('/ru/login'); // Використовуємо `replace`, щоб не зберігати зайві переходи в історії
        }
      }

      setIsLoading(false);
    };

    checkUser();
  }, [user, router]);

  if (isLoading) return null; // Запобігає миготінню контенту

  return user ? <>{children}</> : null;
}
