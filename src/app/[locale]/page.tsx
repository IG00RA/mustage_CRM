'use client';

import PrivateRoute from '@/components/PrivateRoute/PrivateRoute';
import Sidebar from '@/components/Sidebar/Sidebar';

export default function Home() {
  return (
    <PrivateRoute>
      <Sidebar />
      <main></main>
    </PrivateRoute>
  );
}
