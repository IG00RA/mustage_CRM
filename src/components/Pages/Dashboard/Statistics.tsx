'use client';

import { useEffect } from 'react';
import { useSalesStore } from '@/store/salesStore';
import { useUsersStore } from '@/store/usersStore';
import styles from './Statistics.module.css';
import SalesSummary from './SalesSummary/SalesSummary';
import SalesChart from './SalesChart/SalesChart';

export default function Statistics() {
  const { sales, fetchSalesSummary } = useSalesStore();
  const { currentUser, fetchCurrentUser } = useUsersStore();

  useEffect(() => {
    const initialize = async () => {
      if (!currentUser) {
        try {
          await fetchCurrentUser();
        } catch (error) {
          console.error('Failed to fetch current user:', error);
          return;
        }
      }
      fetchSalesSummary();
    };

    initialize();
  }, [fetchSalesSummary, fetchCurrentUser, currentUser]);

  return (
    <section className={styles.section}>
      <SalesSummary salesData={sales} />
      <SalesChart />
    </section>
  );
}
