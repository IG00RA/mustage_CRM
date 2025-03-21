'use client';

import { useTranslations } from 'next-intl';
import styles from './CancelBtn.module.css';

interface ButtonProps {
  onClick?: () => void;
  text: string;
  type?: 'submit' | 'button';
}

export default function CancelBtn({
  text,
  onClick,
  type = 'button',
}: ButtonProps) {
  const t = useTranslations();

  return (
    <button type={type} className={styles.button} onClick={onClick}>
      {t(text)}
    </button>
  );
}
