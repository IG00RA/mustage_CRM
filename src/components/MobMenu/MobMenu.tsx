import styles from './MobMenu.module.css';
import Sidebar from '../Sidebar/Sidebar';
import { MobMenuProps } from '@/types/componentsTypes';

export default function MobMenu({ isMenuOpen, closeMenu }: MobMenuProps) {
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
        <Sidebar closeMenu={closeMenu} />
      </div>
    </div>
  );
}
