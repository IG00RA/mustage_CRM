'use client';

import { useTranslations } from 'next-intl';
import styles from './CancelBtn.module.css';

interface ButtonProps {
  onClick?: () => void;
  text: string;
  type?: 'submit' | 'button';
}

const CancelBtn: React.FC<ButtonProps> = ({
  text,
  onClick,
  type = 'button',
}) => {
  const t = useTranslations();

  return (
    <button type={type} className={styles.button} onClick={onClick}>
      {t(text)}
    </button>
  );
};

export default CancelBtn;
