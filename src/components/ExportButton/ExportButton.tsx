'use client';

import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import styles from '@/components/Statistics/Statistics.module.css';

interface ExportButtonProps {
  onExport: () => void;
}

const ExportButton: React.FC<ExportButtonProps> = ({ onExport }) => {
  const t = useTranslations();

  return (
    <button className={styles.download_button} onClick={onExport}>
      <Icon
        className={styles.download_icon}
        name="icon-cloud-download"
        width={16}
        height={16}
      />
      {t('Statistics.chart.buttonText')}
    </button>
  );
};

export default ExportButton;
