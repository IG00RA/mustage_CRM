import { create } from 'zustand';
import { Sale } from '@/api/sales/data';

interface Category {
  account_category_id: number;
  account_category_name: string;
  description: string | null;
}

interface Subcategory {
  account_subcategory_id: number;
  account_subcategory_name: string;
  account_category_id: number;
  price: number;
  cost_price: number;
  description: string | null;
}

type SalesState = {
  sales: Sale[];
  chartSales: Sale[];
  loading: boolean;
  error: string | null;
  dateRange: string;
  customPeriodLabel: string;
  categories: Category[];
  subcategories: Subcategory[];
  setDateRange: (range: string) => void;
  setCustomPeriodLabel: (period: string) => void;
  fetchSalesSummary: () => Promise<void>;
  fetchReport: (
    reportType: 'hourly' | 'daily' | 'monthly' | 'yearly' | 'custom',
    params: {
      date?: string;
      startDate?: string;
      endDate?: string;
      category_id?: number;
      subcategory_id?: number;
    }
  ) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchSubcategories: (categoryId?: number) => Promise<void>;
};

export const useSalesStore = create<SalesState>(set => ({
  sales: [],
  chartSales: [],
  loading: false,
  error: null,
  dateRange: 'today',
  customPeriodLabel: '',
  categories: [],
  subcategories: [],
  setDateRange: range => set({ dateRange: range }),
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
      const queryParams = new URLSearchParams();
      // Перевіряємо, чи передані обидва параметри, і обираємо лише один
      if (params.subcategory_id) {
        queryParams.append('subcategory_id', String(params.subcategory_id));
      } else if (params.category_id) {
        queryParams.append('category_id', String(params.category_id));
      }

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
          break;
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_HOST_BACK
        }${endpoint}&${queryParams.toString()}`,
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

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HOST_BACK}/categories?limit=100`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data: Category[] = await response.json();
      set({ categories: data, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },

  fetchSubcategories: async (categoryId?: number) => {
    set({ loading: true, error: null });
    try {
      const url = categoryId
        ? `${process.env.NEXT_PUBLIC_HOST_BACK}/subcategories?category_id=${categoryId}&limit=100`
        : `${process.env.NEXT_PUBLIC_HOST_BACK}/subcategories?limit=100`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Failed to fetch subcategories');
      const data: Subcategory[] = await response.json();
      set({ subcategories: data, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  },
}));
