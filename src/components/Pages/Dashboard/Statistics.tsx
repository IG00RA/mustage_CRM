'use client';

import { useEffect, useState } from 'react';
import { useSalesStore } from '@/store/salesStore';
import { useUsersStore } from '@/store/usersStore';
import styles from './Statistics.module.css';
import SalesSummary from './SalesSummary/SalesSummary';
import SalesChart from './SalesChart/SalesChart';

export default function Statistics() {
  const { sales, fetchSalesSummary } = useSalesStore();
  const { currentUser, fetchCurrentUser } = useUsersStore();
  const [selectedSellerIds, setSelectedSellerIds] = useState<string[]>([]);

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
      fetchSalesSummary(
        currentUser?.is_admin && selectedSellerIds.length > 0
          ? selectedSellerIds
          : undefined
      );
    };

    initialize();
  }, [fetchSalesSummary, fetchCurrentUser, currentUser, selectedSellerIds]);

  return (
    <section className={styles.section}>
      <SalesSummary salesData={sales} />
      <SalesChart
        selectedSellerIds={selectedSellerIds}
        setSelectedSellerIds={setSelectedSellerIds}
      />
    </section>
  );
}
