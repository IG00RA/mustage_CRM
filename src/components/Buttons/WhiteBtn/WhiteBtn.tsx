'use client';

import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import styles from './WhiteBtn.module.css';

interface ButtonProps {
  onClick: () => void;
  text: string;
  icon?: string;
  iconFill?: string;
  type?: 'submit' | 'button';
}

export default function WhiteBtn({
  text,
  onClick,
  type = 'button',
  icon,
  iconFill,
}: ButtonProps) {
  const t = useTranslations();

  return (
    <button type={type} className={styles.button} onClick={onClick}>
      {icon && (
        <>
          <Icon className={styles.icon} name={icon} width={16} height={16} />

          <Icon
            className={styles.icon_hov}
            name={iconFill ? iconFill : icon}
            width={16}
            height={16}
          />
        </>
      )}

      {t(text)}
    </button>
  );
}
