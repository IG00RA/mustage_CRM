'use client';

import { useTranslations } from 'next-intl';
import styles from './SubmitBtn.module.css';

interface ButtonProps {
  onClick?: () => void;
  text: string;
  type?: 'submit' | 'button';
}

export default function SubmitBtn({
  text,
  onClick,
  type = 'submit',
}: ButtonProps) {
  const t = useTranslations();

  return (
    <button type={type} className={styles.button} onClick={onClick}>
      {t(text)}
    </button>
  );
}
