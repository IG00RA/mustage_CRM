import { create } from 'zustand';
import { Sale } from '@/api/sales/data';

type SalesState = {
  sales: Sale[]; // Дані для SalesSummary (Today, Week, Month)
  chartSales: Sale[]; // Дані для SalesChart
  loading: boolean;
  error: string | null;
  fetchSalesSummary: () => Promise<void>;
  fetchHourlyReport: (date?: string) => Promise<void>;
  fetchDailyReport: (startDate: string, endDate: string) => Promise<void>;
  fetchMonthlyReport: (startDate: string, endDate: string) => Promise<void>;
  fetchYearlyReport: (startDate: string, endDate: string) => Promise<void>;
  fetchCustomReport: (
    startDate: string,
    endDate: string,
    type: 'daily' | 'monthly' | 'yearly'
  ) => Promise<void>;
};

export const useSalesStore = create<SalesState>(set => ({
  sales: [],
  chartSales: [],
  loading: false,
  error: null,

  fetchSalesSummary: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_BACK}/sales/summary`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
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

  fetchHourlyReport: async (date = new Date().toISOString().split('T')[0]) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_BACK}/sales/hourly-report?date=${date}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch hourly report');
      }

      const data = await response.json();
      const chartSales: Sale[] = Object.entries(data).map(
        ([period, report]: [string, any]) => ({
          period,
          amount: report.total_amount,
          quantity: report.sales_count,
        })
      );

      set({ chartSales, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  fetchDailyReport: async (startDate: string, endDate: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_BACK}/sales/daily-report?start_date=${startDate}&end_date=${endDate}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch daily report');
      }

      const data = await response.json();
      const chartSales: Sale[] = Object.entries(data).map(
        ([period, report]: [string, any]) => ({
          period,
          amount: report.total_amount,
          quantity: report.sales_count,
        })
      );

      set({ chartSales, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  fetchMonthlyReport: async (startDate: string, endDate: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_BACK}/sales/monthly-report?start_date=${startDate}&end_date=${endDate}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch monthly report');
      }

      const data = await response.json();
      const chartSales: Sale[] = Object.entries(data).map(
        ([period, report]: [string, any]) => ({
          period,
          amount: report.total_amount,
          quantity: report.sales_count,
        })
      );

      set({ chartSales, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  fetchYearlyReport: async (startDate: string, endDate: string) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_BACK}/sales/yearly-report?start_date=${startDate}&end_date=${endDate}`,
        { method: 'GET', headers: { 'Content-Type': 'application/json' } }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch yearly report');
      }

      const data = await response.json();
      const chartSales: Sale[] = Object.entries(data).map(
        ([period, report]: [string, any]) => ({
          period,
          amount: report.total_amount,
          quantity: report.sales_count,
        })
      );

      set({ chartSales, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  fetchCustomReport: async (
    startDate: string,
    endDate: string,
    type: 'daily' | 'monthly' | 'yearly'
  ) => {
    set({ loading: true, error: null });
    try {
      const endpoint =
        type === 'daily'
          ? `/sales/daily-report?start_date=${startDate}&end_date=${endDate}`
          : type === 'monthly'
          ? `/sales/monthly-report?start_date=${startDate}&end_date=${endDate}`
          : `/sales/yearly-report?start_date=${startDate}&end_date=${endDate}`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_BACK}${endpoint}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} report`);
      }

      const data = await response.json();
      const chartSales: Sale[] = Object.entries(data).map(
        ([period, report]: [string, any]) => ({
          period,
          amount: report.total_amount,
          quantity: report.sales_count,
        })
      );

      set({ chartSales, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
}));
