'use client';

import { useEffect } from 'react';
import { useSalesStore } from '@/store/salesStore';
import styles from './Statistics.module.css';
import SalesSummary from './SalesSummary/SalesSummary';
import SalesChart from './SalesChart/SalesChart';

export default function Statistics() {
  const { sales, fetchSalesSummary } = useSalesStore();

  useEffect(() => {
    fetchSalesSummary();
  }, [fetchSalesSummary]);

  return (
    <section className={styles.section}>
      <SalesSummary salesData={sales} />
      <SalesChart />
    </section>
  );
}
