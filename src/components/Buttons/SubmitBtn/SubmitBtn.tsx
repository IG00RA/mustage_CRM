'use client';

import { useTranslations } from 'next-intl';
import styles from './SubmitBtn.module.css';

interface ButtonProps {
  onClick?: () => void;
  text: string;
  type?: 'submit' | 'button';
  disabled?: boolean;
}

export default function SubmitBtn({
  text,
  onClick,
  disabled = false,
  type = 'submit',
}: ButtonProps) {
  const t = useTranslations();

  return (
    <button
      type={type}
      disabled={disabled}
      className={styles.button}
      onClick={onClick}
    >
      {t(text)}
    </button>
  );
}
