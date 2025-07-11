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
import { useEffect, useRef, useState } from 'react';
import { useUsersStore } from '@/store/usersStore';
import {
  accParMenu,
  accParMenuBottom,
  mainParMenu,
  otherParMenu,
} from '@/data/sidebar';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { SidebarProps } from '@/types/componentsTypes';
import { DropdownPortal } from '@/helpers/DropdownPortal';

// [
//     name: 'Обзор',
//     name: 'Категории',
//     name: 'Подкатегории',
//     name: 'Все аккаунты',
//     name: 'Загрузка аккаунтов',
//     name: 'Выгрузка аккаунтов',
//     name: 'Раздача аккаунтов',
//     name: 'Замена аккаунтов',
//     name: 'Убрать аккаунты с продажи',
//     name: 'Управление автофармом',
//     name: 'Промокоды',
//     name: 'Все рефералы',
//     name: 'Статистика реферальной системы',
//     name: 'Наборы акаунтов',
// ];

type OpenMenusState = {
  distribution: boolean;
  referrals: boolean;
  users: boolean;
  autoFarm: boolean;
};

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
  roles: string;
  referrals_all: string;
  referrals_stat: string;
  sets: string;
};

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
  roles: 'Должности',
  referrals_all: 'Все рефералы',
  referrals_stat: 'Статистика реферальной системы',
  sets: 'Наборы акаунтов',
};

export default function Sidebar({
  closeMenu,
  isCollapsed,
  toggleCollapse,
  isHovered,
  setIsHovered,
}: SidebarProps & {
  isHovered?: boolean;
  setIsHovered?: (value: boolean) => void;
}) {
  const t = useTranslations();
  const pathname = usePathname();

  const [isBarOpen, setIsBarOpen] = useState(false);

  const [openMenus, setOpenMenus] = useState<OpenMenusState>({
    distribution: false,
    referrals: false,
    users: false,
    autoFarm: false,
  });

  const { currentUser, fetchCurrentUser, resetCurrentUser, loading } =
    useUsersStore();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const barRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLElement>(null);

  const mainNavItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const accNavItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const accBottomNavItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const otherNavItemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const autoFarmRef = useRef<HTMLLIElement | null>(null);
  const usersRef = useRef<HTMLLIElement | null>(null);

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

  useEffect(() => {
    if (isInitialLoad && !currentUser && !loading) {
      fetchCurrentUser()
        .catch(() => {
          handleLogout();
        })
        .finally(() => setIsInitialLoad(false));
    }
  }, [currentUser, fetchCurrentUser, isInitialLoad, loading]);

  useEffect(() => {
    const distributionLinks = [
      'distribution_settings',
      'distribution_create',
      'distribution_all',
    ];
    const referralsLinks = ['referrals_all', 'referrals_stat'];
    const usersLinks = ['users', 'roles'];
    const autoFarmLinks = ['auto_farm', 'auto_farm_servers'];

    const isAnyDistributionActive = distributionLinks.some(link =>
      isActiveSub(link)
    );
    const isAnyReferralsActive = referralsLinks.some(link => isActiveSub(link));
    const isAnyUsersActive = usersLinks.some(link => isActiveSub(link));
    const isAnyAutoFarmActive = autoFarmLinks.some(link => isActiveSub(link));

    setOpenMenus({
      distribution: isAnyDistributionActive,
      referrals: isAnyReferralsActive,
      users: isAnyUsersActive,
      autoFarm: isAnyAutoFarmActive,
    });
  }, [pathname]);

  const isMenuAllowed = (link: string) => {
    if (!currentUser || currentUser.is_admin) return true;
    if (!currentUser.functions || currentUser.functions.length === 0)
      return true;
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
  const hasUsersAccess = isMenuAllowed('users') || isMenuAllowed('roles');
  const hasAutoFarmAccess = isMenuAllowed('auto_farm');
  const hasSetsAccess = isMenuAllowed('sets');

  const effectiveIsHovered = isHovered ?? false;
  const handleMouseEnter = () =>
    isCollapsed && setIsHovered && setIsHovered(true);
  const handleMouseLeave = () =>
    isCollapsed && setIsHovered && setIsHovered(false);

  if (loading || (isInitialLoad && !currentUser) || !currentUser) {
    return (
      <aside
        className={`${styles.sidebar} ${isBarOpen ? styles.active : ''} ${
          isCollapsed && !effectiveIsHovered ? styles.collapsed : ''
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles.logo_link_wrap}>
          <Link onClick={closeMenu} href="/" className={styles.logo_wrap}>
            <Image
              src={logo}
              alt="Mustage CRM logo"
              className={styles.logo_img}
              width={0}
              height={0}
              sizes="100vw"
            />
            <strong className={styles.logo_text}>
              {t('Sidebar.logoText')}
            </strong>
          </Link>
          <Icon
            className={`${styles.arrow_down} ${isBarOpen ? styles.active : ''}`}
            name="icon-angle-down"
            width={16}
            height={16}
            color="#A9A9C1"
          />
        </div>
        {isCollapsed && !effectiveIsHovered ? (
          <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
            <div className={styles.user_wrap}>
              <div className={styles.user_image_wrap}>
                <Skeleton circle width={40} height={40} />
                <div className={styles.nick_wrap}>
                  <Skeleton width={50} height={16} />
                  <Skeleton width={55} height={12} style={{ marginTop: 8 }} />
                </div>
              </div>
              <Skeleton circle width={24} height={24} />
            </div>

            <Skeleton
              width={55}
              height={16}
              style={{ marginBottom: 16, marginTop: 22 }}
            />
            <div className={styles.nav}>
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <div key={index} style={{ marginBottom: 12 }}>
                    <Skeleton height={40} />
                  </div>
                ))}
            </div>

            <Skeleton width={60} height={16} style={{ marginBottom: 16 }} />
            <div className={styles.nav}>
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <div key={index} style={{ marginBottom: 12 }}>
                    <Skeleton height={40} />
                  </div>
                ))}
            </div>

            <Skeleton width={55} height={16} style={{ marginBottom: 16 }} />
            <div className={styles.nav}>
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <div key={index} style={{ marginBottom: 12 }}>
                    <Skeleton height={40} />
                  </div>
                ))}
            </div>
          </SkeletonTheme>
        ) : (
          <SkeletonTheme baseColor="#e0e0e0" highlightColor="#f5f5f5">
            <div className={styles.user_wrap}>
              <div className={styles.user_image_wrap}>
                <Skeleton circle width={40} height={40} />
                <div className={styles.nick_wrap}>
                  <Skeleton width={100} height={16} />
                  <Skeleton width={60} height={12} style={{ marginTop: 8 }} />
                </div>
              </div>
              <Skeleton circle width={24} height={24} />
            </div>

            <Skeleton
              width={120}
              height={16}
              style={{ marginBottom: 16, marginTop: 22 }}
            />
            <div className={styles.nav}>
              {Array(3)
                .fill(0)
                .map((_, index) => (
                  <div key={index} style={{ marginBottom: 12 }}>
                    <Skeleton height={40} />
                  </div>
                ))}
            </div>

            <Skeleton width={120} height={16} style={{ marginBottom: 16 }} />
            <div className={styles.nav}>
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <div key={index} style={{ marginBottom: 12 }}>
                    <Skeleton height={40} />
                  </div>
                ))}
            </div>

            <Skeleton width={120} height={16} style={{ marginBottom: 16 }} />
            <div className={styles.nav}>
              {Array(2)
                .fill(0)
                .map((_, index) => (
                  <div key={index} style={{ marginBottom: 12 }}>
                    <Skeleton height={40} />
                  </div>
                ))}
            </div>
          </SkeletonTheme>
        )}
      </aside>
    );
  }

  return (
    <aside
      ref={sidebarRef}
      className={`${styles.sidebar} ${isBarOpen ? styles.active : ''} ${
        isCollapsed && !effectiveIsHovered ? styles.collapsed : ''
      }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <DropdownPortal
        anchorRef={sidebarRef}
        isCollapsed={isCollapsed}
        isHovered={effectiveIsHovered}
      >
        <button
          onClick={toggleCollapse}
          className={`${styles.toggle_button} ${
            !isCollapsed ? styles.toggle_button_active : ''
          }`}
        >
          <Icon
            className={styles.toggle_button_icon_left}
            name="icon-angle-down"
            width={16}
            height={16}
          />
          <Icon
            className={styles.toggle_button_icon_right}
            name="icon-angle-down"
            width={16}
            height={16}
          />
        </button>
      </DropdownPortal>

      <div className={styles.logo_link_wrap}>
        <Link onClick={closeMenu} href="/" className={styles.logo_wrap}>
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
        <div className={styles.controls_wrap}>
          <div
            ref={barRef}
            onClick={barToggler}
            className={`${styles.arrow_down_wrap} ${
              isBarOpen ? styles.active : ''
            }`}
          >
            <Icon
              className={`${styles.top_arrow_down} ${
                isBarOpen ? styles.active : ''
              }`}
              name="icon-angle-down"
              width={16}
              height={16}
              color="#A9A9C1"
            />
            <div
              className={`${styles.links_wrap} ${
                isBarOpen ? styles.active : ''
              }`}
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
      </div>
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
              {currentUser?.first_name} {currentUser?.last_name}
            </h2>
            <p className={styles.role}>
              {currentUser?.is_admin ? 'Admin' : currentUser?.role?.name}
            </p>
          </div>
        </div>
        <form action={handleLogout}>
          <button
            className={styles.log_out_btn}
            onClick={closeMenu}
            type="submit"
          >
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
                  ref={el => {
                    mainNavItemRefs.current[index] = el;
                  }}
                  className={`${styles.nav_item} ${
                    isActive(item.link) ? styles.active : ''
                  }`}
                  key={index}
                >
                  <Link
                    onClick={closeMenu}
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
        hasDistributionAccess ||
        hasAutoFarmAccess) && (
        <>
          <h3 className={styles.parTitle}>{t('Sidebar.accPar')}</h3>
          <nav className={styles.nav}>
            <ul role="menu">
              {filteredAccParMenu.map((item, index) => (
                <li
                  ref={el => {
                    accNavItemRefs.current[index] = el;
                  }}
                  className={`${styles.nav_item} ${
                    isActive(item.link) ? styles.active : ''
                  }`}
                  key={index}
                >
                  <Link
                    onClick={closeMenu}
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
                  {(!isCollapsed || effectiveIsHovered) && (
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
                            onClick={closeMenu}
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
                            onClick={closeMenu}
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
                            onClick={closeMenu}
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
                  )}
                </li>
              )} */}
              {filteredAccParMenuBottom.map((item, index) => (
                <li
                  ref={el => {
                    accBottomNavItemRefs.current[index] = el;
                  }}
                  className={`${styles.nav_item} ${
                    isActive(item.link) ? styles.active : ''
                  }`}
                  key={index}
                >
                  <Link
                    onClick={closeMenu}
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
              {hasAutoFarmAccess && (
                <li
                  ref={autoFarmRef}
                  className={`${styles.nav_item} ${
                    openMenus.autoFarm ? styles.active : ''
                  }`}
                  key={'autoFarm'}
                  onClick={() =>
                    setOpenMenus(prev => ({
                      ...prev,
                      autoFarm: !prev.autoFarm,
                    }))
                  }
                >
                  <div className={styles.nav_item_link}>
                    <Icon
                      className={styles.logo}
                      name={'icon-send-2'}
                      width={22}
                      height={22}
                    />
                    <Icon
                      className={styles.logo_hov}
                      name={'icon-fill_send-2'}
                      width={22}
                      height={22}
                    />
                    <span className={styles.nav_item_text}>
                      {t('Sidebar.accParMenu.autoFarmControl')}
                    </span>
                    <Icon
                      className={`${styles.arrow_down} ${
                        openMenus.autoFarm ? styles.active : ''
                      }`}
                      name="icon-angle-down"
                      width={16}
                      height={16}
                      color="#A9A9C1"
                    />
                  </div>
                  {(!isCollapsed || effectiveIsHovered) && (
                    <ul
                      className={`${styles.select_options} ${
                        openMenus.autoFarm ? styles.select_open : ''
                      }`}
                    >
                      <li
                        key={'autoFarm'}
                        onClick={() =>
                          setOpenMenus(prev => ({ ...prev, autoFarm: false }))
                        }
                      >
                        <Link
                          onClick={closeMenu}
                          className={`${styles.option_item} ${
                            isActiveSub('auto_farm')
                              ? styles.active_sub_link
                              : ''
                          }`}
                          href={`/ru/auto_farm`}
                        >
                          <div className={styles.list_sub_mark_wrap}>
                            <span className={styles.list_sub_mark}></span>
                          </div>
                          <p className={styles.list_sub_text}>
                            {t('Sidebar.accParMenu.autoFarmAcc')}
                          </p>
                        </Link>
                      </li>
                      <li
                        key={'autoFarmServers'}
                        onClick={() =>
                          setOpenMenus(prev => ({ ...prev, autoFarm: false }))
                        }
                      >
                        <Link
                          onClick={closeMenu}
                          className={`${styles.option_item} ${
                            isActiveSub('auto_farm_servers')
                              ? styles.active_sub_link
                              : ''
                          }`}
                          href={`/ru/auto_farm_servers`}
                        >
                          <div className={styles.list_sub_mark_wrap}>
                            <span className={styles.list_sub_mark}></span>
                          </div>
                          <p className={styles.list_sub_text}>
                            {t('Sidebar.accParMenu.autoFarmServers')}
                          </p>
                        </Link>
                      </li>
                    </ul>
                  )}
                </li>
              )}
            </ul>
          </nav>
        </>
      )}
      {hasSetsAccess && (
        <nav className={styles.nav}>
          <ul role="menu">
            <li
              className={`${styles.nav_item} ${
                isActive('sets') ? styles.active : ''
              }`}
              key={'sets'}
            >
              <Link
                onClick={closeMenu}
                className={styles.nav_item_link}
                href={`/ru/sets`}
              >
                <Icon
                  className={styles.logo}
                  name={'icon-elements'}
                  width={22}
                  height={22}
                />
                <Icon
                  className={styles.logo_hov}
                  name={'icon-fill_elements'}
                  width={22}
                  height={22}
                />
                <span className={styles.nav_item_text}>
                  {t('Sidebar.setsPar')}
                </span>
              </Link>
            </li>
          </ul>
        </nav>
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
                  return null;
                }
                return (
                  <li
                    ref={el => {
                      otherNavItemRefs.current[index] = el;
                    }}
                    className={`${styles.nav_item} ${
                      isActive(item.link) ? styles.active : ''
                    }`}
                    key={index}
                  >
                    <Link
                      onClick={closeMenu}
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
                  ref={usersRef}
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
                      name={'icon-users'}
                      width={22}
                      height={22}
                    />
                    <Icon
                      className={styles.logo_hov}
                      name={'icon-fill_users'}
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
                  {(!isCollapsed || effectiveIsHovered) && (
                    <ul
                      className={`${styles.select_options} ${
                        openMenus.users ? styles.select_open : ''
                      }`}
                    >
                      {isMenuAllowed('users') && (
                        <li
                          key={'users'}
                          onClick={() =>
                            setOpenMenus(prev => ({
                              ...prev,
                              users: false,
                            }))
                          }
                        >
                          <Link
                            onClick={closeMenu}
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
                            setOpenMenus(prev => ({
                              ...prev,
                              users: false,
                            }))
                          }
                        >
                          <Link
                            onClick={closeMenu}
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
                  )}
                </li>
              )}
            </ul>
          </nav>
        </>
      )}
    </aside>
  );
}
