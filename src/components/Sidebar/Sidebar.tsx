'use client';
import Link from 'next/link';
import styles from './Sidebar.module.css';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';
import logo from '@/img/logo.svg';
import avatar from '@/img/sidebar/avatar.png';
import { useTranslations } from 'next-intl';

const Sidebar = () => {
  const t = useTranslations();

  const logout = useAuthStore(state => state.logout);
  const handleLogout = () => {
    logout();
  };
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo_wrap}>
        <Image
          src={logo}
          alt="Mustage CRM logo"
          className={styles.logo}
          width={0}
          height={0}
          sizes="100vw"
        />
        <span className={styles.logo_wrap}>{t('Sidebar.logoText')}</span>
      </div>
      <div className={styles.user_wrap}>
        <Image
          src={avatar}
          alt="Mustage CRM user"
          className={styles.user_logo}
          width={0}
          height={0}
          sizes="100vw"
        />
        <div className={styles.nick_wrap}>
          <span className={styles.nick}>Hudson Alvarez</span>
          <span className={styles.role}>Admin</span>
        </div>
      </div>
      <nav>
        <span className={styles.par_text}>{t('Sidebar.mainPar')}</span>

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
