'use client';

import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import styles from './AddBtn.module.css';

interface ButtonProps {
  onClick: () => void;
  text: string;
  icon?: string;
  iconFill?: string;
  type?: 'submit' | 'button';
}

export default function AddBtn({
  text,
  icon,
  iconFill,
  onClick,
  type = 'button',
}: ButtonProps) {
  const t = useTranslations();

  return (
    <button type={type} className={styles.button} onClick={onClick}>
      <Icon
        className={styles.icon}
        name={icon ? icon : 'icon-add'}
        width={16}
        height={16}
      />
      <Icon
        className={styles.icon_hov}
        name={iconFill ? iconFill : 'icon-add-fill'}
        width={16}
        height={16}
      />
      {t(text)}
    </button>
  );
}
