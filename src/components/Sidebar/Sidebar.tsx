'use client';
import Link from 'next/link';
import styles from './Sidebar.module.css';
import { useAuthStore } from '@/store/authStore';

const Sidebar = () => {
  const logout = useAuthStore(state => state.logout);

  // Handle logout
  const handleLogout = () => {
    logout(); // This will clear the user from Zustand store and localStorage
  };
  return (
    <aside className={styles.sidebar}>
      <nav>
        <ul>
          <li>
            <Link href="/ru/dashboard">🏠 Dashboard</Link>
          </li>
          <li>
            <Link href="/ru/dashboard/statistics">📊 Statistics</Link>
          </li>
          <li>
            <button onClick={handleLogout}>Logout</button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
