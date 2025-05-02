import '../../../styles/globals.css';
import 'react-toastify/dist/ReactToastify.css';

import Sidebar from '@/components/Sidebar/Sidebar';

import styles from './Dashboard.module.css';

export const generateMetadata = async () => {
  return {
    title: `Админ-панель | Mustage CRM`,
    description: 'Админ-панель для управления аккаунтами',
  };
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.main_wrap}>
      <Sidebar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
}
