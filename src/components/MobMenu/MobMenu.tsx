import { useTranslations } from 'next-intl';
// import { menuItems, socialItems } from '@/data/sidebar';
import styles from './MobMenu.module.css';
import Icon from '@/helpers/Icon';
import Link from 'next/link';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';

type MobMenuProps = {
  query: string | '';
  isMenuOpen: boolean;
  closeMenu: () => void;
  locale: string;
};

export default function MobMenu({
  isMenuOpen,
  query,
  closeMenu,
  locale,
}: MobMenuProps) {
  const t = useTranslations('');

  return (
    <div
      onClick={closeMenu}
      className={`${styles.mobile_wrap} ${
        isMenuOpen && styles.mobile_menu_open
      }`}
    >
      <div
        className={styles.burger_menu}
        onClick={event => event.stopPropagation()}
      >
        <div className={styles.head_wrapper}>
          <Link className={styles.logo_wrap} href={`/${locale}/${query}`}>
            <Icon name="icon-header_logo" width={40} height={33} />
            {/* <span className={styles.logo_text}>{t('Header.home')}</span> */}
          </Link>
          <div
            className={`${styles.burger_wrap} ${
              isMenuOpen ? styles.burger_open : ''
            }`}
            onClick={closeMenu}
          >
            <span className={styles.line}></span>
            <span className={styles.line}></span>
            <span className={styles.line}></span>
          </div>
        </div>
        {/* <nav>
          <ul>
            {menuItems.map((item, index) => (
              <li
                className={styles.mobile_item}
                key={index}
                onClick={closeMenu}
              >
                <Link className={styles.mobile_link} href={item.href}>
                  {t(item.label)}
                </Link>
              </li>
            ))}
          </ul>
        </nav> */}

        <div className={styles.lang_wrap}>
          <LanguageSwitcher headerStyle={false} />
        </div>
        {/* <ul className={styles.social}>
          {socialItems.map((item, index) => (
            <li className={styles.social_item} key={index}>
              <a
                className={styles.social_link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.area}
              >
                <Icon name={item.icon} width={32} height={32} />
              </a>
            </li>
          ))}
        </ul> */}
      </div>
    </div>
  );
}
