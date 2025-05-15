'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './Header.module.css';
import MobMenu from '../MobMenu/MobMenu';
import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import logo from '@/img/logo.svg';
import Icon from '@/helpers/Icon';
import { MenuStateProps } from '@/types/componentsTypes';

export default function Header({
  isMenuOpen,
  closeMenu,
  openMenu,
}: MenuStateProps) {
  const t = useTranslations('');
  const [isBarOpen, setIsBarOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);

  const barToggler = () => {
    setIsBarOpen(!isBarOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (barRef.current && !barRef.current.contains(event.target as Node)) {
        setIsBarOpen(false);
      }
    };

    if (isBarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isBarOpen]);

  return (
    <header
      className={`${styles.header} ${isMenuOpen && styles.mobile_menu_open}`}
    >
      <div className={styles.logo_link_wrap}>
        <Link href="/" className={styles.logo_wrap}>
          <Image
            src={logo}
            alt="Mustage CRM logo"
            className={styles.logo_img}
            width={0}
            height={0}
            sizes="100vw"
          />
          <strong className={styles.logo_text}>{t('Sidebar.logoText')}</strong>
        </Link>

        <div
          ref={barRef}
          onClick={barToggler}
          className={`${styles.arrow_down_wrap} ${
            isBarOpen ? styles.active : ''
          }`}
        >
          <Icon
            className={`${styles.arrow_down}`}
            name="icon-angle-down"
            width={16}
            height={16}
            color="#A9A9C1"
          />
          <div
            className={`${styles.links_wrap} ${isBarOpen ? styles.active : ''}`}
          >
            <Link href="/" className={styles.link}>
              MUSTAGE FINANCE
            </Link>
            <Link
              href="/"
              className={`${styles.link} ${isBarOpen ? styles.active : ''}`}
            >
              <span>ACCOUNTS PANEL</span>
              <Icon
                className={styles.list_icon}
                name="icon-list-check"
                width={12}
                height={12}
              />
            </Link>
            <Link href="/" className={styles.link}>
              MUSTAGE TASK MANAGER
            </Link>
          </div>
        </div>
      </div>

      <div
        className={`${styles.burger_wrap} ${
          isMenuOpen ? styles.burger_open : ''
        }`}
        onClick={isMenuOpen ? closeMenu : openMenu}
      >
        <span className={styles.line}></span>
        <span className={styles.line}></span>
        <span className={styles.line}></span>
      </div>

      <MobMenu isMenuOpen={isMenuOpen} closeMenu={closeMenu} />
    </header>
  );
}
