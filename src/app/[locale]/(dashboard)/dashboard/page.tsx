'use client';
import Statistics from '@/components/Statistics/Statistics';
import { useAuthStore } from '@/store/authStore';

export default function Dashboard() {
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
  };

  return <Statistics />;
}
