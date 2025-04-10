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
import { useEffect, useState } from 'react';
import { useUsersStore } from '@/store/usersStore';
import {
  accParMenu,
  accParMenuBottom,
  mainParMenu,
  otherParMenu,
} from '@/data/sidebar';

// Тип для стану відкритих меню
type OpenMenusState = {
  distribution: boolean;
  referrals: boolean;
  users: boolean; // Додано для користувачів
};

// Тип для зіставлення пунктів меню з функціями
type MenuFunctionMap = {
  [key: string]: string;
  dashboard: string;
  category: string;
  names: string;
  all_accounts: string;
  upload: string;
  load: string;
  distribution_settings: string;
  distribution_create: string;
  distribution_all: string;
  replacement: string;
  remove_sale: string;
  auto_farm: string;
  promo_code: string;
  users: string;
  roles: string; // Додано для "Должности"
  referrals_all: string;
  referrals_stat: string;
};

// Список функцій для зіставлення прав
const availableFunctions = [
  { function_id: 1, name: 'Обзор' },
  { function_id: 2, name: 'Категории' },
  { function_id: 3, name: 'Подкатегории' },
  { function_id: 4, name: 'Все аккаунты' },
  { function_id: 5, name: 'Загрузка аккаунтов' },
  { function_id: 6, name: 'Выгрузка аккаунтов' },
  { function_id: 7, name: 'Раздача аккаунтов' },
  { function_id: 8, name: 'Замена аккаунтов' },
  { function_id: 9, name: 'Убрать аккаунты с продажи' },
  { function_id: 10, name: 'Управление автофармом' },
  { function_id: 11, name: 'Промокоды' },
  { function_id: 12, name: 'Все рефералы' },
  { function_id: 13, name: 'Статистика реферальной системы' },
  { function_id: 14, name: 'Пользователи' }, // Додано для "Пользователи"
  { function_id: 15, name: 'Должности' }, // Додано для "Должности"
];

// Відповідність між пунктами меню та іменами функцій
const menuFunctionMap: MenuFunctionMap = {
  dashboard: 'Обзор',
  category: 'Категории',
  names: 'Подкатегории',
  all_accounts: 'Все аккаунты',
  upload: 'Загрузка аккаунтов',
  load: 'Выгрузка аккаунтов',
  distribution_settings: 'Раздача аккаунтов',
  distribution_create: 'Раздача аккаунтов',
  distribution_all: 'Раздача аккаунтов',
  replacement: 'Замена аккаунтов',
  remove_sale: 'Убрать аккаунты с продажи',
  auto_farm: 'Управление автофармом',
  promo_code: 'Промокоды',
  users: 'Пользователи',
  roles: 'Должности', // Додано для "Должности"
  referrals_all: 'Все рефералы',
  referrals_stat: 'Статистика реферальной системы',
};

export default function Sidebar() {
  const t = useTranslations();
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<OpenMenusState>({
    distribution: false,
    referrals: false,
    users: false, // Додано для користувачів
  });

  const { currentUser, fetchCurrentUser, resetCurrentUser, loading } =
    useUsersStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad && !currentUser && !loading) {
      fetchCurrentUser().finally(() => setIsInitialLoad(false));
    }
  }, [currentUser, fetchCurrentUser, isInitialLoad, loading]);

  useEffect(() => {
    const distributionLinks = [
      'distribution_settings',
      'distribution_create',
      'distribution_all',
    ];
    const referralsLinks = ['referrals_all', 'referrals_stat'];
    const usersLinks = ['users', 'roles']; // Додано для користувачів

    const isAnyDistributionActive = distributionLinks.some(link =>
      isActiveSub(link)
    );
    const isAnyReferralsActive = referralsLinks.some(link => isActiveSub(link));
    const isAnyUsersActive = usersLinks.some(link => isActiveSub(link)); // Додано для користувачів

    setOpenMenus({
      distribution: isAnyDistributionActive,
      referrals: isAnyReferralsActive,
      users: isAnyUsersActive, // Додано для користувачів
    });
  }, [pathname]);

  const isMenuAllowed = (link: string) => {
    if (!currentUser || currentUser.is_admin) return true; // Адміни мають доступ до всього
    if (!currentUser.functions || currentUser.functions.length === 0)
      return true; // Порожній масив = максимальні права

    const functionName = menuFunctionMap[link];
    return currentUser.functions.some(
      func => func.function_name === functionName
    );
  };

  const isActive = (link: string) => {
    const menuKey = link.split('_')[0] as keyof OpenMenusState;
    return pathname === `/ru/${link}` && !openMenus[menuKey];
  };

  const isActiveSub = (link: string) => pathname === `/ru/${link}`;

  const handleLogout = async () => {
    resetCurrentUser();
    await logout();
  };

  const filteredMainParMenu = mainParMenu.filter(item =>
    isMenuAllowed(item.link)
  );
  const filteredAccParMenu = accParMenu.filter(item =>
    isMenuAllowed(item.link)
  );
  const filteredAccParMenuBottom = accParMenuBottom.filter(item =>
    isMenuAllowed(item.link)
  );
  const filteredOtherParMenu = otherParMenu.filter(item =>
    isMenuAllowed(item.link)
  );

  const hasDistributionAccess =
    isMenuAllowed('distribution_settings') ||
    isMenuAllowed('distribution_create') ||
    isMenuAllowed('distribution_all');
  const hasReferralsAccess =
    isMenuAllowed('referrals_all') || isMenuAllowed('referrals_stat');
  const hasUsersAccess = isMenuAllowed('users') || isMenuAllowed('roles'); // Додано для користувачів

  // Показуємо лоадер, якщо дані користувача завантажуються або ще не визначені
  if (loading || (isInitialLoad && !currentUser)) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.loader}>Loading...</div>
      </aside>
    );
  }

  // Якщо користувач скинутий (null), не показуємо меню
  if (!currentUser) {
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
      </aside>
    );
  }

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
            <h2 className={styles.nick}>
              {currentUser.first_name} {currentUser.last_name}
            </h2>
            <p className={styles.role}>
              {currentUser.is_admin ? 'Admin' : 'User'}
            </p>
          </div>
        </div>
        <form action={handleLogout}>
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

      {filteredMainParMenu.length > 0 && (
        <>
          <h3 className={styles.parTitle}>{t('Sidebar.mainPar')}</h3>
          <nav className={styles.nav}>
            <ul role="menu">
              {filteredMainParMenu.map((item, index) => (
                <li
                  className={`${styles.nav_item} ${
                    isActive(item.link) ? styles.active : ''
                  }`}
                  key={index}
                >
                  <Link
                    className={styles.nav_item_link}
                    href={`/ru/${item.link}`}
                  >
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
                    <span className={styles.nav_item_text}>
                      {t(item.header)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}

      {(filteredAccParMenu.length > 0 ||
        filteredAccParMenuBottom.length > 0 ||
        hasDistributionAccess) && (
        <>
          <h3 className={styles.parTitle}>{t('Sidebar.accPar')}</h3>
          <nav className={styles.nav}>
            <ul role="menu">
              {filteredAccParMenu.map((item, index) => (
                <li
                  className={`${styles.nav_item} ${
                    isActive(item.link) ? styles.active : ''
                  }`}
                  key={index}
                >
                  <Link
                    className={styles.nav_item_link}
                    href={`/ru/${item.link}`}
                  >
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
                    <span className={styles.nav_item_text}>
                      {t(item.header)}
                    </span>
                  </Link>
                </li>
              ))}
              {/* {hasDistributionAccess && (
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
                    {isMenuAllowed('distribution_settings') && (
                      <li
                        key={'distributionSettings'}
                        onClick={() =>
                          setOpenMenus(prev => ({
                            ...prev,
                            distribution: false,
                          }))
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
                    )}
                    {isMenuAllowed('distribution_create') && (
                      <li
                        key={'distributionCreate'}
                        onClick={() =>
                          setOpenMenus(prev => ({
                            ...prev,
                            distribution: false,
                          }))
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
                    )}
                    {isMenuAllowed('distribution_all') && (
                      <li
                        key={'distributionAll'}
                        onClick={() =>
                          setOpenMenus(prev => ({
                            ...prev,
                            distribution: false,
                          }))
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
                    )}
                  </ul>
                </li>
              )} */}
              {filteredAccParMenuBottom.map((item, index) => (
                <li
                  className={`${styles.nav_item} ${
                    isActive(item.link) ? styles.active : ''
                  }`}
                  key={index}
                >
                  <Link
                    className={styles.nav_item_link}
                    href={`/ru/${item.link}`}
                  >
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
                    <span className={styles.nav_item_text}>
                      {t(item.header)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}

      {(filteredOtherParMenu.length > 0 ||
        hasReferralsAccess ||
        hasUsersAccess) && (
        <>
          <h3 className={styles.parTitle}>{t('Sidebar.otherPar')}</h3>
          <nav className={styles.nav}>
            <ul role="menu">
              {filteredOtherParMenu.map((item, index) => {
                if (item.link === 'users') {
                  return null; // Пропускаємо "users", бо воно тепер у розкривному меню
                }
                return (
                  <li
                    className={`${styles.nav_item} ${
                      isActive(item.link) ? styles.active : ''
                    }`}
                    key={index}
                  >
                    <Link
                      className={styles.nav_item_link}
                      href={`/ru/${item.link}`}
                    >
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
                      <span className={styles.nav_item_text}>
                        {t(item.header)}
                      </span>
                    </Link>
                  </li>
                );
              })}
              {hasUsersAccess && (
                <li
                  className={`${styles.nav_item} ${
                    openMenus.users ? styles.active : ''
                  }`}
                  key={'users'}
                  onClick={() =>
                    setOpenMenus(prev => ({
                      ...prev,
                      users: !prev.users,
                    }))
                  }
                >
                  <div className={styles.nav_item_link}>
                    <Icon
                      className={styles.logo}
                      name={'icon-users'} // Іконка для "Пользователи"
                      width={22}
                      height={22}
                    />
                    <Icon
                      className={styles.logo_hov}
                      name={'icon-fill_users'} // Іконка для активного стану
                      width={22}
                      height={22}
                    />
                    <span className={styles.nav_item_text}>
                      {t('Sidebar.otherParMenu.users')}
                    </span>
                    <Icon
                      className={`${styles.arrow_down} ${
                        openMenus.users ? styles.active : ''
                      }`}
                      name="icon-angle-down"
                      width={16}
                      height={16}
                      color="#A9A9C1"
                    />
                  </div>
                  <ul
                    className={`${styles.select_options} ${
                      openMenus.users ? styles.select_open : ''
                    }`}
                  >
                    {isMenuAllowed('users') && (
                      <li
                        key={'users'}
                        onClick={() =>
                          setOpenMenus(prev => ({ ...prev, users: false }))
                        }
                      >
                        <Link
                          className={`${styles.option_item} ${
                            isActiveSub('users') ? styles.active_sub_link : ''
                          }`}
                          href={`/ru/users`}
                        >
                          <div className={styles.list_sub_mark_wrap}>
                            <span className={styles.list_sub_mark}></span>
                          </div>
                          <p className={styles.list_sub_text}>
                            {t('Sidebar.otherParMenu.users')}
                          </p>
                        </Link>
                      </li>
                    )}
                    {isMenuAllowed('roles') && (
                      <li
                        key={'roles'}
                        onClick={() =>
                          setOpenMenus(prev => ({ ...prev, users: false }))
                        }
                      >
                        <Link
                          className={`${styles.option_item} ${
                            isActiveSub('roles') ? styles.active_sub_link : ''
                          }`}
                          href={`/ru/roles`}
                        >
                          <div className={styles.list_sub_mark_wrap}>
                            <span className={styles.list_sub_mark}></span>
                          </div>
                          <p className={styles.list_sub_text}>
                            {t('Sidebar.otherParMenu.roles')}
                          </p>
                        </Link>
                      </li>
                    )}
                  </ul>
                </li>
              )}
              {/* {hasReferralsAccess && (
                <li
                  className={`${styles.nav_item} ${
                    openMenus.referrals ? styles.active : ''
                  }`}
                  key={'referrals'}
                  onClick={() =>
                    setOpenMenus(prev => ({
                      ...prev,
                      referrals: !prev.referrals,
                    }))
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
                    {isMenuAllowed('referrals_all') && (
                      <li
                        key={'referralsAll'}
                        onClick={() =>
                          setOpenMenus(prev => ({ ...prev, referrals: false }))
                        }
                      >
                        <Link
                          className={`${styles.option_item} ${
                            isActiveSub('referrals_all')
                              ? styles.active_sub_link
                              : ''
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
                    )}
                    {isMenuAllowed('referrals_stat') && (
                      <li
                        key={'referralsStat'}
                        onClick={() =>
                          setOpenMenus(prev => ({ ...prev, referrals: false }))
                        }
                      >
                        <Link
                          className={`${styles.option_item} ${
                            isActiveSub('referrals_stat')
                              ? styles.active_sub_link
                              : ''
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
                    )}
                  </ul>
                </li>
              )} */}
            </ul>
          </nav>
        </>
      )}
    </aside>
  );
}
