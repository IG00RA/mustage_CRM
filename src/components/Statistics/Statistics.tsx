'use client';

import { useSalesStore } from '@/store/salesStore';
import styles from './Statistics.module.css';
import SalesSummary from './SalesSummary/SalesSummary';
import SalesChart from './SalesChart/SalesChart';

const Statistics = () => {
  const salesData = useSalesStore(state => state.sales);

  return (
    <section className={styles.section}>
      <SalesSummary salesData={salesData} />
      <SalesChart salesData={salesData} />
    </section>
  );
};

export default Statistics;
