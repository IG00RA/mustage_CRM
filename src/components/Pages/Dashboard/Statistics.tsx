'use client';

import { useEffect, useState } from 'react';
import { useSalesStore } from '@/store/salesStore';
import { useUsersStore } from '@/store/usersStore';
import styles from './Statistics.module.css';
import SalesSummary from './SalesSummary/SalesSummary';
import SalesChart from './SalesChart/SalesChart';
import { toast } from 'react-toastify';

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
          toast.error(`Failed to fetch current user: ${error}`);
          return;
        }
      }
      if (currentUser) {
        fetchSalesSummary(
          currentUser.is_admin && selectedSellerIds.length > 0
            ? selectedSellerIds
            : undefined
        );
      }
      // if (!currentUser?.is_admin) {
      //   console.log('seller_id', currentUser?.seller?.seller_id);

      //   console.log('currentUser', currentUser);
      //   await fetchSalesSummary([String(currentUser?.seller?.seller_id)]);
      // }
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
