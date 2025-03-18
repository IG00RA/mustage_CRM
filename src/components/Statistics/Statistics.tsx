'use client';

import { useEffect } from 'react';
import { useSalesStore } from '@/store/salesStore';
import styles from './Statistics.module.css';
import SalesSummary from './SalesSummary/SalesSummary';
import SalesChart from './SalesChart/SalesChart';

const Statistics = () => {
  const { sales, loading, error, fetchSalesSummary } = useSalesStore();

  useEffect(() => {
    fetchSalesSummary(); // Лише для SalesSummary
  }, [fetchSalesSummary]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <section className={styles.section}>
      <SalesSummary salesData={sales} />
      <SalesChart />
    </section>
  );
};

export default Statistics;
