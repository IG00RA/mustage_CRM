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

  // Функція для обчислення загальної суми по полю
  const calculateTotal = (field: 'quantity' | 'amount') =>
    salesData.reduce((sum, sale) => sum + sale[field], 0);

  // Функція для форматування суми з $ і заокругленням до 2 знаків
  const formatAmount = (amount: number) => `$${amount.toFixed(2)}`;

  // Визначення типу звіту на основі формату period
  const isHourly = salesData.every(sale =>
    /^[0-2][0-9]:[0-5][0-9]$/.test(sale.period)
  );
  const isDaily = salesData.every(sale =>
    /^\d{4}-\d{2}-\d{2}$/.test(sale.period)
  );
  const isMonthly = salesData.every(sale => /^\d{4}-\d{2}$/.test(sale.period));
  const isYearly = salesData.every(sale => /^\d{4}$/.test(sale.period));
  const isSummary = salesData.some(sale =>
    ['Today', 'Week', 'Month'].includes(sale.period)
  );

  const getPeriodLabel = () => {
    if (isHourly) return t('Statistics.stat.periodDay');
    if (isDaily) return t('Statistics.stat.periodWeek');
    if (isMonthly) return t('Statistics.stat.periodMonth');
    if (isYearly) return t('Statistics.stat.periodYear');
    return t('Statistics.stat.periodDay');
  };

  return (
    <div className={styles.stat_wrap}>
      <h2 className={styles.header}>{t('Sidebar.mainParMenu.review')}</h2>
      <ul className={styles.stat_list}>
        {/* Кількість */}
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
            {getPeriodLabel()}
          </span>
          <span className={styles.stat_quantity}>
            {isSummary
              ? salesData.find(sale => sale.period === 'Today')?.quantity || 0
              : calculateTotal('quantity')}
          </span>
        </li>
        {/* Сума */}
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
            {getPeriodLabel()}
          </span>
          <span className={styles.stat_quantity}>
            {isSummary
              ? formatAmount(
                  salesData.find(sale => sale.period === 'Today')?.amount || 0
                )
              : formatAmount(calculateTotal('amount'))}
          </span>
        </li>

        {/* Додаткові блоки для summary */}
        {isSummary && (
          <>
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
                {salesData.find(sale => sale.period === 'Week')?.quantity || 0}
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
                {formatAmount(
                  salesData.find(sale => sale.period === 'Week')?.amount || 0
                )}
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
                {salesData.find(sale => sale.period === 'Month')?.quantity || 0}
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
                {formatAmount(
                  salesData.find(sale => sale.period === 'Month')?.amount || 0
                )}
              </span>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default SalesSummary;
