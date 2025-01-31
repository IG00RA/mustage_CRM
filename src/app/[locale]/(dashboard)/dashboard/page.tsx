'use client';
import Statistics from '@/components/Statistics/Statistics';
import { useAuthStore } from '@/store/authStore';

export default function Dashboard() {
  const logout = useAuthStore(state => state.logout);

  const handleLogout = () => {
    logout();
  };

  return (
    <div>
      <h1>Welcome to Dashboard</h1>
      <Statistics />
    </div>
  );
}
