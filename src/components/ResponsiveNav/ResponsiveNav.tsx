'use client';

import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar/Sidebar';
import Header from '@/components/Header/Header';
import styles from '../../app/[locale]/(CRM)/Dashboard.module.css';

export default function ResponsiveNav({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const savedCollapsed = localStorage.getItem('sidebarCollapsed');
    if (savedCollapsed !== null) {
      setIsCollapsed(savedCollapsed === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed.toString());
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = 'auto';
    document.body.style.touchAction = 'auto';
  };

  const openMenu = () => {
    setIsMenuOpen(true);
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={styles.main_wrap}>
      {isMobile ? (
        <Header
          isMenuOpen={isMenuOpen}
          openMenu={openMenu}
          closeMenu={closeMenu}
        />
      ) : (
        <Sidebar
          setIsHovered={setIsHovered}
          isHovered={isHovered}
          closeMenu={closeMenu}
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
      )}

      <main
        className={`${styles.main} ${
          isCollapsed && !isHovered ? styles.mainCollapsed : ''
        }`}
      >
        {children}
      </main>
    </div>
  );
}
