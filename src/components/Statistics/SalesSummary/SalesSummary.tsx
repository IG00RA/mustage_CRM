'use client';

import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import styles from '../Statistics.module.css';
import { Sale } from '@/api/sales/data';
import { useSalesStore } from '@/store/salesStore';

interface SalesSummaryProps {
  salesData: Sale[];
}

const SalesSummary: React.FC<SalesSummaryProps> = ({ salesData }) => {
  const t = useTranslations();

  const formatAmount = (amount: number) => `$${amount.toFixed(2)}`;

  const getByPeriod = (period: string, field: 'quantity' | 'amount') => {
    const sale = salesData.find(sale => sale.period === period);
    return sale ? sale[field] : 0;
  };

  return (
    <div className={styles.stat_wrap}>
      <h2 className={styles.header}>{t('Sidebar.mainParMenu.review')}</h2>
      <ul className={styles.stat_list}>
        <li className={styles.stat_item}>
          <h3 className={styles.stat_header}>
            {t('Statistics.stat.headerQuantity')}
          </h3>
          <span className={styles.stat_period}>
            <Icon
              className={styles.logo}
              name="icon-stat_calendar"
              width={14}
              height={14}
            />
            {t('Statistics.stat.periodDay')}
          </span>
          <span className={styles.stat_quantity}>
            {getByPeriod('Today', 'quantity')}
          </span>
        </li>
        <li className={styles.stat_item}>
          <h3 className={styles.stat_header}>
            {t('Statistics.stat.headerSum')}
          </h3>
          <span className={styles.stat_period}>
            <Icon
              className={styles.logo}
              name="icon-stat_calendar"
              width={14}
              height={14}
            />
            {t('Statistics.stat.periodDay')}
          </span>
          <span className={styles.stat_quantity}>
            {formatAmount(getByPeriod('Today', 'amount'))}
          </span>
        </li>
        <li className={styles.stat_item}>
          <h3 className={styles.stat_header}>
            {t('Statistics.stat.headerQuantity')}
          </h3>
          <span className={styles.stat_period}>
            <Icon
              className={styles.logo}
              name="icon-stat_calendar"
              width={14}
              height={14}
            />
            {t('Statistics.stat.periodWeek')}
          </span>
          <span className={styles.stat_quantity}>
            {getByPeriod('Week', 'quantity')}
          </span>
        </li>
        <li className={styles.stat_item}>
          <h3 className={styles.stat_header}>
            {t('Statistics.stat.headerSum')}
          </h3>
          <span className={styles.stat_period}>
            <Icon
              className={styles.logo}
              name="icon-stat_calendar"
              width={14}
              height={14}
            />
            {t('Statistics.stat.periodWeek')}
          </span>
          <span className={styles.stat_quantity}>
            {formatAmount(getByPeriod('Week', 'amount'))}
          </span>
        </li>
        <li className={styles.stat_item}>
          <h3 className={styles.stat_header}>
            {t('Statistics.stat.headerQuantity')}
          </h3>
          <span className={styles.stat_period}>
            <Icon
              className={styles.logo}
              name="icon-stat_calendar"
              width={14}
              height={14}
            />
            {t('Statistics.stat.periodMonth')}
          </span>
          <span className={styles.stat_quantity}>
            {getByPeriod('Month', 'quantity')}
          </span>
        </li>
        <li className={styles.stat_item}>
          <h3 className={styles.stat_header}>
            {t('Statistics.stat.headerSum')}
          </h3>
          <span className={styles.stat_period}>
            <Icon
              className={styles.logo}
              name="icon-stat_calendar"
              width={14}
              height={14}
            />
            {t('Statistics.stat.periodMonth')}
          </span>
          <span className={styles.stat_quantity}>
            {formatAmount(getByPeriod('Month', 'amount'))}
          </span>
        </li>
      </ul>
    </div>
  );
};

export default SalesSummary;
