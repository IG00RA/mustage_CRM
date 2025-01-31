'use client';

import { useAuthStore } from '@/store/authStore';
import PrivateRoute from '@/components/PrivateRoute/PrivateRoute';

export default function Dashboard() {
  // Access logout function from the store
  const logout = useAuthStore(state => state.logout);

  // Handle logout
  const handleLogout = () => {
    logout(); // This will clear the user from Zustand store and localStorage
  };

  return (
    <PrivateRoute>
      <div>
        <h1>Welcome to Dashboard</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </PrivateRoute>
  );
}
