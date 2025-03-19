'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';
import { logout } from '@/actions/auth';
import Image from 'next/image';
import avatar from '@/img/sidebar/avatar.png';
import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import logo from '@/img/logo.svg';

import {
  accParMenu,
  accParMenuBottom,
  mainParMenu,
  otherParMenu,
} from '@/data/sidebar';
import { useEffect, useState } from 'react';

const Sidebar = () => {
  const t = useTranslations();
  const pathname = usePathname();

  // Оновлений стан для підменю
  const [openMenus, setOpenMenus] = useState({
    distribution: false,
    referrals: false,
  });

  // Оновлений useEffect для автоматичного відкриття підменю
  useEffect(() => {
    const distributionLinks = [
      'distribution_settings',
      'distribution_create',
      'distribution_all',
    ];
    const referralsLinks = ['referrals_all', 'referrals_stat'];

    const isAnyDistributionActive = distributionLinks.some(link =>
      isActiveSub(link)
    );
    const isAnyReferralsActive = referralsLinks.some(link => isActiveSub(link));

    setOpenMenus({
      distribution: isAnyDistributionActive,
      referrals: isAnyReferralsActive,
    });
  }, [pathname]);

  // Функція для визначення активного посилання
  const isActive = (link: string): boolean => {
    const menuKey = link.split('_')[0] as 'distribution' | 'referrals';
    return pathname === `/ru/${link}` && !openMenus[menuKey];
  };

  const isActiveSub = (link: string): boolean => pathname === `/ru/${link}`;

  return (
    <aside className={styles.sidebar}>
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
      <div className={styles.user_wrap}>
        <div className={styles.user_image_wrap}>
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
        <form action={logout}>
          <button className={styles.log_out_btn} type="submit">
            <Icon
              className={styles.log_out_icon}
              name={'icon-log-out'}
              color="#a9a9c1"
              width={16}
              height={16}
            />
          </button>
        </form>
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
            className={`${styles.nav_item} ${
              openMenus.distribution ? styles.active : ''
            }`}
            key={'distribution'}
            onClick={() =>
              setOpenMenus(prev => ({
                ...prev,
                distribution: !prev.distribution,
              }))
            }
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
                  openMenus.distribution ? styles.active : ''
                }`}
                name="icon-angle-down"
                width={16}
                height={16}
                color="#A9A9C1"
              />
            </div>
            <ul
              className={`${styles.select_options} ${
                openMenus.distribution ? styles.select_open : ''
              }`}
            >
              <li
                key={'distributionSettings'}
                onClick={() =>
                  setOpenMenus(prev => ({ ...prev, distribution: false }))
                }
              >
                <Link
                  className={`${styles.option_item} ${
                    isActiveSub('distribution_settings')
                      ? styles.active_sub_link
                      : ''
                  }`}
                  href={`/ru/distribution_settings`}
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
                onClick={() =>
                  setOpenMenus(prev => ({ ...prev, distribution: false }))
                }
              >
                <Link
                  className={`${styles.option_item} ${
                    isActiveSub('distribution_create')
                      ? styles.active_sub_link
                      : ''
                  }`}
                  href={`/ru/distribution_create`}
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
                onClick={() =>
                  setOpenMenus(prev => ({ ...prev, distribution: false }))
                }
              >
                <Link
                  className={`${styles.option_item} ${
                    isActiveSub('distribution_all')
                      ? styles.active_sub_link
                      : ''
                  }`}
                  href={`/ru/distribution_all`}
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
          <li
            className={`${styles.nav_item} ${
              openMenus.referrals ? styles.active : ''
            }`}
            key={'referrals'}
            onClick={() =>
              setOpenMenus(prev => ({ ...prev, referrals: !prev.referrals }))
            }
          >
            <div className={styles.nav_item_link}>
              <Icon
                className={styles.logo}
                name={'icon-briefcase-2'}
                width={22}
                height={22}
              />
              <Icon
                className={`${styles.logo_hov} ${styles.logo_hov_referrer}`}
                name={'icon-fill_briefcase-2'}
                width={22}
                height={22}
              />
              <p
                className={`${styles.nav_item_referrer} ${styles.nav_item_text}`}
              >
                <span>{t('Sidebar.otherParMenu.referrals')}</span>
                <span className={styles.referrer_quantity}>32+</span>
              </p>
              <Icon
                className={`${styles.arrow_down} ${
                  openMenus.referrals ? styles.active : ''
                }`}
                name="icon-angle-down"
                width={16}
                height={16}
                color="#A9A9C1"
              />
            </div>
            <ul
              className={`${styles.select_options} ${
                openMenus.referrals ? styles.select_open : ''
              }`}
            >
              <li
                key={'referralsAll'}
                onClick={() =>
                  setOpenMenus(prev => ({ ...prev, referrals: false }))
                }
              >
                <Link
                  className={`${styles.option_item} ${
                    isActiveSub('referrals_all') ? styles.active_sub_link : ''
                  }`}
                  href={`/ru/referrals_all`}
                >
                  <div className={styles.list_sub_mark_wrap}>
                    <span className={styles.list_sub_mark}></span>
                  </div>
                  <p className={styles.list_sub_text}>
                    {t('Sidebar.otherParMenu.referralsAll')}
                  </p>
                </Link>
              </li>
              <li
                key={'referralsStat'}
                onClick={() =>
                  setOpenMenus(prev => ({ ...prev, referrals: false }))
                }
              >
                <Link
                  className={`${styles.option_item} ${
                    isActiveSub('referrals_stat') ? styles.active_sub_link : ''
                  }`}
                  href={`/ru/referrals_stat`}
                >
                  <div className={styles.list_sub_mark_wrap}>
                    <span className={styles.list_sub_mark}></span>
                  </div>
                  <p className={styles.list_sub_text}>
                    {t('Sidebar.otherParMenu.referralsStat')}
                  </p>
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
