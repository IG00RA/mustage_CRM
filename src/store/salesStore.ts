import { create } from 'zustand';
import { Sale } from '@/api/sales/data';

type SalesState = {
  sales: Sale[];
  loading: boolean;
  error: string | null;
  fetchSalesSummary: () => Promise<void>;
  fetchHourlyReport: (date?: string) => Promise<void>;
  fetchDailyReport: (startDate: string, endDate: string) => Promise<void>;
  fetchMonthlyReport: (startDate: string, endDate: string) => Promise<void>;
  fetchYearlyReport: (startDate: string, endDate: string) => Promise<void>;
};

export const useSalesStore = create<SalesState>(set => ({
  sales: [],
  loading: false,
  error: null,

  // Завантаження агрегованих даних (Today, Week, Month)
  fetchSalesSummary: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_BACK}/sales/summary`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch summary data');
      }

      const data = await response.json();
      const sales: Sale[] = [
        {
          period: 'Today',
          amount: data.today.total_amount,
          quantity: data.today.sales_count,
        },
        {
          period: 'Week',
          amount: data.week.total_amount,
          quantity: data.week.sales_count,
        },
        {
          period: 'Month',
          amount: data.month.total_amount,
          quantity: data.month.sales_count,
        },
      ];

      set({ sales, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Завантаження погодинних даних
  fetchHourlyReport: async (date = new Date().toISOString().split('T')[0]) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_BACK}/sales/hourly-report?date=${date}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch hourly report');
      }

      const data = await response.json();
      const sales: Sale[] = Object.entries(data).map(
        ([period, report]: [string, any]) => ({
          period,
          amount: report.total_amount,
          quantity: report.sales_count,
        })
      );

      set({ sales, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Завантаження щоденних даних
  fetchDailyReport: async (startDate: string, endDate: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_BACK}/sales/daily-report?start_date=${startDate}&end_date=${endDate}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch daily report');
      }

      const data = await response.json();
      const sales: Sale[] = Object.entries(data).map(
        ([period, report]: [string, any]) => ({
          period,
          amount: report.total_amount,
          quantity: report.sales_count,
        })
      );

      set({ sales, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Завантаження місячних даних
  fetchMonthlyReport: async (startDate: string, endDate: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_BACK}/sales/monthly-report?start_date=${startDate}&end_date=${endDate}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch monthly report');
      }

      const data = await response.json();
      const sales: Sale[] = Object.entries(data).map(
        ([period, report]: [string, any]) => ({
          period,
          amount: report.total_amount,
          quantity: report.sales_count,
        })
      );

      set({ sales, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  // Завантаження річних даних
  fetchYearlyReport: async (startDate: string, endDate: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_BACK}/sales/yearly-report?start_date=${startDate}&end_date=${endDate}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          // credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch yearly report');
      }

      const data = await response.json();
      const sales: Sale[] = Object.entries(data).map(
        ([period, report]: [string, any]) => ({
          period,
          amount: report.total_amount,
          quantity: report.sales_count,
        })
      );

      set({ sales, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
}));
