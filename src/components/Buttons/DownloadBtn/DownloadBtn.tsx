'use client';

import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import styles from './DownloadBtn.module.css';

interface ButtonProps {
  onClick: () => void;
  text: string;
  type?: 'submit' | 'button';
}

const DownloadBtn: React.FC<ButtonProps> = ({
  text,
  onClick,
  type = 'button',
}) => {
  const t = useTranslations();

  return (
    <button type={type} className={styles.button} onClick={onClick}>
      <Icon
        className={styles.icon}
        name="icon-cloud-download"
        width={16}
        height={16}
      />
      <Icon
        className={styles.icon_hov}
        name="icon-cloud-download-fill"
        width={16}
        height={16}
      />
      {t(text)}
    </button>
  );
};

export default DownloadBtn;
