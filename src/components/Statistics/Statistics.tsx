'use client';

import { useEffect, useState } from 'react';
import { useSalesStore } from '@/store/salesStore';
import styles from './Statistics.module.css';
import SalesSummary from './SalesSummary/SalesSummary';
import SalesChart from './SalesChart/SalesChart';

const Statistics = () => {
  const {
    sales,
    loading,
    error,
    fetchSalesSummary,
    fetchHourlyReport,
    fetchDailyReport,
    fetchMonthlyReport,
    fetchYearlyReport,
  } = useSalesStore();
  const [reportType, setReportType] = useState<
    'summary' | 'hourly' | 'daily' | 'monthly' | 'yearly'
  >('summary');

 useEffect(() => {
   const today = new Date().toISOString().split('T')[0];
   const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
     .toISOString()
     .split('T')[0];
   const yearStart = '2024-01-01';

   switch (reportType) {
     case 'summary':
       fetchSalesSummary();
       break;
     case 'hourly':
       fetchHourlyReport(today);
       break;
     case 'daily':
       fetchDailyReport(weekAgo, today);
       break;
     case 'monthly':
       fetchMonthlyReport(yearStart, today);
       break;
     case 'yearly':
       fetchYearlyReport('2020-03-18', today);
       break;
   }
 }, [
   reportType,
   fetchSalesSummary,
   fetchHourlyReport,
   fetchDailyReport,
   fetchMonthlyReport,
   fetchYearlyReport,
 ]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <section className={styles.section}>
      <SalesSummary salesData={sales} />
      <SalesChart salesData={sales} />
    </section>
  );
};

export default Statistics;
