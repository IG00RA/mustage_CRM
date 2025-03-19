import { create } from 'zustand';
import { Sale } from '@/api/sales/data';

type SalesState = {
  sales: Sale[];
  chartSales: Sale[];
  loading: boolean;
  error: string | null;
  dateRange: string;
  setDateRange: (range: string) => void;
  customPeriodLabel: string;
  setCustomPeriodLabel: (period: string) => void;
  fetchSalesSummary: () => Promise<void>;
  fetchReport: (
    reportType: 'hourly' | 'daily' | 'monthly' | 'yearly' | 'custom',
    params: { date?: string; startDate?: string; endDate?: string }
  ) => Promise<void>;
};

export const useSalesStore = create<SalesState>(set => ({
  sales: [],
  chartSales: [],
  loading: false,
  error: null,
  dateRange: 'today',
  setDateRange: range => set({ dateRange: range }),
  customPeriodLabel: '',
  setCustomPeriodLabel: period => set({ customPeriodLabel: period }),

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
      if (!response.ok) throw new Error('Failed to fetch summary data');
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

  fetchReport: async (reportType, params) => {
    set({ loading: true, error: null });
    try {
      let endpoint = '';
      switch (reportType) {
        case 'hourly':
          endpoint = `/sales/hourly-report?date=${
            params.date || new Date().toISOString().split('T')[0]
          }`;
          break;
        case 'daily':
          endpoint = `/sales/daily-report?start_date=${params.startDate}&end_date=${params.endDate}`;
          break;
        case 'monthly':
          endpoint = `/sales/monthly-report?start_date=${params.startDate}&end_date=${params.endDate}`;
          break;
        case 'yearly':
          endpoint = `/sales/yearly-report?start_date=${params.startDate}&end_date=${params.endDate}`;
          break;
        case 'custom':
          endpoint = `/sales/daily-report?start_date=${params.startDate}&end_date=${params.endDate}`;
          break; // Можна розширити для інших типів у майбутньому
      }
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_BACK}${endpoint}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) throw new Error(`Failed to fetch ${reportType} report`);
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
