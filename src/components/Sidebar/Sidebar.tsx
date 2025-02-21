'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { useAuthStore } from '@/store/authStore';
import Image from 'next/image';
import avatar from '@/img/sidebar/avatar.png';
import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import {
  accParMenu,
  accParMenuBottom,
  mainParMenu,
  otherParMenu,
} from '@/data/sidebar';
import { useState } from 'react';

const Sidebar = () => {
  const t = useTranslations();
  const pathname = usePathname();

  const [isOpen, setIsOpen] = useState(false);

  const logout = useAuthStore(state => state.logout);
  const handleLogout = () => {
    logout();
  };

  // Функція для визначення активного посилання
  const isActive = (link: string): boolean =>
    pathname === `/ru/${link}` && !isOpen;

  return (
    <aside className={styles.sidebar}>
      {/* <Link href="/" className={styles.logo_wrap}>
        <Image
          src={logo}
          alt="Mustage CRM logo"
          className={styles.logo_img}
          width={0}
          height={0}
          sizes="100vw"
        />
        <strong className={styles.logo_text}>{t('Sidebar.logoText')}</strong>
      </Link> */}
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
          <h2 className={styles.nick}>Hudson Alvarez</h2>
          <p className={styles.role}>Admin</p>
        </div>
      </div>

      <h3 className={styles.parTitle}>{t('Sidebar.mainPar')}</h3>
      <nav className={styles.nav}>
        <ul role="menu">
          {mainParMenu.map((item, index) => (
            <li
              className={`${styles.nav_item} ${
                isActive(item.link) ? styles.active : ''
              }`}
              key={index}
            >
              <Link className={styles.nav_item_link} href={`/ru/${item.link}`}>
                <Icon
                  className={styles.logo}
                  name={item.logo}
                  width={22}
                  height={22}
                />
                <Icon
                  className={styles.logo_hov}
                  name={item.logo_hov}
                  width={22}
                  height={22}
                />
                <span className={styles.nav_item_text}>{t(item.header)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <h3 className={styles.parTitle}>{t('Sidebar.accPar')}</h3>
      <nav className={styles.nav}>
        <ul role="menu">
          {accParMenu.map((item, index) => (
            <li
              className={`${styles.nav_item} ${
                isActive(item.link) ? styles.active : ''
              }`}
              key={index}
            >
              <Link className={styles.nav_item_link} href={`/ru/${item.link}`}>
                <Icon
                  className={styles.logo}
                  name={item.logo}
                  width={22}
                  height={22}
                />
                <Icon
                  className={styles.logo_hov}
                  name={item.logo_hov}
                  width={22}
                  height={22}
                />
                <span className={styles.nav_item_text}>{t(item.header)}</span>
              </Link>
            </li>
          ))}
          <li
            className={`${styles.nav_item} ${isOpen ? styles.active : ''}`}
            key={'distribution'}
            onClick={() => setIsOpen(prev => !prev)}
          >
            <div className={styles.nav_item_link}>
              <Icon
                className={styles.logo}
                name={'icon-box-2'}
                width={22}
                height={22}
              />
              <Icon
                className={styles.logo_hov}
                name={'icon-fill_box-2'}
                width={22}
                height={22}
              />
              <span className={styles.nav_item_text}>
                {t('Sidebar.accParMenu.distribution')}
              </span>
              <Icon
                className={`${styles.arrow_down} ${
                  isOpen ? styles.active : ''
                }`}
                name="icon-angle-down"
                width={16}
                height={16}
                color="#A9A9C1"
              />
            </div>
            <ul
              className={`${styles.select_options} ${
                isOpen ? styles.select_open : ''
              }`}
            >
              <li
                key={'distributionSettings'}
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                <Link
                  className={`${styles.option_item} ${
                    isActive('distributionSettings')
                      ? styles.active_sub_link
                      : ''
                  }`}
                  href={`/ru/distributionSettings`}
                >
                  <div className={styles.list_sub_mark_wrap}>
                    <span className={styles.list_sub_mark}></span>
                  </div>
                  <p className={styles.list_sub_text}>
                    {t('Sidebar.accParMenu.distributionSettings')}
                  </p>
                </Link>
              </li>
              <li
                key={'distributionCreate'}
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                <Link
                  className={`${styles.option_item} ${
                    isActive('distributionCreate') ? styles.active_sub_link : ''
                  }`}
                  href={`/ru/distributionCreate`}
                >
                  <div className={styles.list_sub_mark_wrap}>
                    <span className={styles.list_sub_mark}></span>
                  </div>
                  <p className={styles.list_sub_text}>
                    {t('Sidebar.accParMenu.distributionCreate')}
                  </p>
                </Link>
              </li>
              <li
                key={'distributionAll'}
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                <Link
                  className={`${styles.option_item} ${
                    isActive('distributionAll') ? styles.active_sub_link : ''
                  }`}
                  href={`/ru/distributionAll`}
                >
                  <div className={styles.list_sub_mark_wrap}>
                    <span className={styles.list_sub_mark}></span>
                  </div>
                  <p className={styles.list_sub_text}>
                    {t('Sidebar.accParMenu.distributionAll')}
                  </p>
                </Link>
              </li>
            </ul>
          </li>
          {accParMenuBottom.map((item, index) => (
            <li
              className={`${styles.nav_item} ${
                isActive(item.link) ? styles.active : ''
              }`}
              key={index}
            >
              <Link className={styles.nav_item_link} href={`/ru/${item.link}`}>
                <Icon
                  className={styles.logo}
                  name={item.logo}
                  width={22}
                  height={22}
                />
                <Icon
                  className={styles.logo_hov}
                  name={item.logo_hov}
                  width={22}
                  height={22}
                />
                <span className={styles.nav_item_text}>{t(item.header)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <h3 className={styles.parTitle}>{t('Sidebar.otherPar')}</h3>
      <nav className={styles.nav}>
        <ul role="menu">
          {otherParMenu.map((item, index) => (
            <li
              className={`${styles.nav_item} ${
                isActive(item.link) ? styles.active : ''
              }`}
              key={index}
            >
              <Link className={styles.nav_item_link} href={`/ru/${item.link}`}>
                <Icon
                  className={styles.logo}
                  name={item.logo}
                  width={22}
                  height={22}
                />
                <Icon
                  className={styles.logo_hov}
                  name={item.logo_hov}
                  width={22}
                  height={22}
                />
                <span className={styles.nav_item_text}>{t(item.header)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
