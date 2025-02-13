'use client';

import { useTranslations } from 'next-intl';
import Icon from '@/helpers/Icon';
import styles from '../Statistics.module.css';
import { Sale } from '@/api/sales/data';

interface SalesSummaryProps {
  salesData: Sale[];
}

const SalesSummary: React.FC<SalesSummaryProps> = ({ salesData }) => {
  const t = useTranslations();

  // Функція для обчислення суми по потрібному полю для заданого фільтру
  const calculateSum = (
    filterFn: (sale: Sale) => boolean,
    field: 'quantity' | 'amount'
  ) => salesData.filter(filterFn).reduce((sum, sale) => sum + sale[field], 0);

  // Фільтр для щоденної статистики
  const dailyFilter = (sale: Sale) =>
    sale.period.includes(':') && !sale.period.startsWith('Yesterday');

  // Фільтр для тижневої статистики (наприклад, продажі з 1 по 7 лютого 2025)
  const weeklyFilter = (sale: Sale) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(sale.period)) {
      const d = new Date(sale.period);
      return (
        d.getFullYear() === 2025 &&
        d.getMonth() === 1 &&
        d.getDate() >= 1 &&
        d.getDate() <= 7
      );
    }
    return false;
  };

  // Фільтр для місячної статистики (наприклад, продажі в січні 2025)
  const monthlyFilter = (sale: Sale) => {
    if (/^\d{4}-\d{2}-\d{2}$/.test(sale.period)) {
      const d = new Date(sale.period);
      return d.getFullYear() === 2025 && d.getMonth() === 0;
    }
    return false;
  };

  return (
    <div className={styles.stat_wrap}>
      <h2 className={styles.header}>{t('Sidebar.mainParMenu.review')}</h2>
      <ul className={styles.stat_list}>
        {/* Щоденна статистика */}
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
            {calculateSum(dailyFilter, 'quantity')}
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
            {calculateSum(dailyFilter, 'amount')}
          </span>
        </li>

        {/* Тижнева статистика */}
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
            {calculateSum(weeklyFilter, 'quantity')}
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
            {calculateSum(weeklyFilter, 'amount')}
          </span>
        </li>

        {/* Місячна статистика */}
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
            {calculateSum(monthlyFilter, 'quantity')}
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
            {calculateSum(monthlyFilter, 'amount')}
          </span>
        </li>
      </ul>
    </div>
  );
};

export default SalesSummary;
