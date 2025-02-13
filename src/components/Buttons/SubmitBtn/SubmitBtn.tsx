'use client';

import { useTranslations } from 'next-intl';
import styles from './SubmitBtn.module.css';

interface ButtonProps {
  onClick?: () => void;
  text: string;
  type?: 'submit' | 'button';
}

const SubmitBtn: React.FC<ButtonProps> = ({
  text,
  onClick,
  type = 'submit',
}) => {
  const t = useTranslations();

  return (
    <button type={type} className={styles.button} onClick={onClick}>
      {t(text)}
    </button>
  );
};

export default SubmitBtn;
