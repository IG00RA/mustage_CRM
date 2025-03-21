import { create } from 'zustand';
import { toast } from 'react-toastify';

interface Sale {
  period: string;
  amount: number;
  quantity: number;
}

interface Category {
  account_category_id: number;
  account_category_name: string;
  description: string | null;
}

export interface Account {
  account_id: number;
  account_name: string;
  subcategory: Subcategory;
  seller_id: number;
  seller: Seller;
  account_data: string;
  archive_link: string;
  status: 'SOLD' | 'NOT SOLD' | 'REPLACED';
}

interface Subcategory {
  account_subcategory_id: number;
  account_subcategory_name: string;
  account_category_id: number;
  price: number;
  cost_price: number;
  description: string | null;
  category: Category;
}

interface Seller {
  seller_id: number;
  seller_name: string;
  visible_in_bot: boolean;
}

// Новий тип для даних звіту
interface ReportData {
  total_amount: number;
  sales_count: number;
}

// Новий тип для необроблених даних аккаунта
interface RawAccount {
  account_id: number;
  account_name: string;
  subcategory: Subcategory;
  seller: Seller;
  account_data: string;
  archive_link: string;
  status: 'SOLD' | 'NOT SOLD' | 'REPLACED';
}

export type RangeType =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'custom';
type ReportType = 'hourly' | 'daily' | 'monthly' | 'yearly' | 'custom';

type SalesState = {
  sales: Sale[];
  chartSales: Sale[];
  accounts: Account[];
  sellers: Seller[];
  loading: boolean;
  error: string | null;
  dateRange: RangeType;
  yearlyChange: number | null;
  customPeriodLabel: string;
  categories: Category[];
  subcategories: Subcategory[];
  setDateRange: (range: RangeType) => void;
  setYearlyChange: (change: number) => void;
  setCustomPeriodLabel: (period: string) => void;
  fetchSalesSummary: () => Promise<void>;
  fetchReport: (
    reportType: ReportType,
    params: {
      date?: string;
      startDate?: string;
      endDate?: string;
      category_id?: number;
      subcategory_id?: number;
    }
  ) => Promise<Sale[]>;
  fetchCategories: () => Promise<void>;
  fetchSubcategories: (categoryId?: number) => Promise<void>;
  fetchSalesAndYearlyChange: (
    range: RangeType,
    customStart?: string,
    customEnd?: string,
    categoryId?: number,
    subcategoryId?: number
  ) => Promise<void>;
  fetchSellers: (visibleInBot?: boolean) => Promise<void>;
  fetchAccounts: (params?: {
    category_id?: number;
    subcategory_id?: number;
    status?: 'SOLD' | 'NOT SOLD' | 'REPLACED';
    seller_id?: number;
    limit?: number;
    offset?: number;
  }) => Promise<void>;
};

const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

export const useSalesStore = create<SalesState>(set => ({
  sales: [],
  chartSales: [],
  accounts: [],
  sellers: [],
  loading: false,
  error: null,
  yearlyChange: null,
  dateRange: 'today',
  customPeriodLabel: '',
  categories: [],
  subcategories: [],
  setYearlyChange: change => set({ yearlyChange: change }),
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
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  },

  fetchReport: async (reportType, params) => {
    try {
      let endpoint = '';
      const queryParams = new URLSearchParams();
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

      // Отримуємо дані з явною типізацією
      const rawData = await response.json();
      // Визначаємо data як об'єкт із ключами типу string і значеннями типу ReportData
      const data: { [key: string]: ReportData } = rawData;

      const sales: Sale[] = Object.entries(data).map(
        ([period, report]: [string, ReportData]) => ({
          period,
          amount: report.total_amount,
          quantity: report.sales_count,
        })
      );
      return sales;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      toast.error(error instanceof Error ? error.message : 'Unknown error');
      return [];
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
      toast.error(error instanceof Error ? error.message : 'Unknown error');
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
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  },

  fetchAccounts: async (params = {}) => {
    set({ loading: true, error: null });

    const accessToken = getCookie('access_token');
    if (!accessToken) {
      set({ loading: false, error: 'No access token found' });
      toast.error('No access token found');
      return;
    }

    try {
      const queryParams = new URLSearchParams();
      if (params.subcategory_id) {
        queryParams.append('subcategory_id', String(params.subcategory_id));
      } else if (params.category_id) {
        queryParams.append('category_id', String(params.category_id));
      }
      if (params.status) queryParams.append('status', params.status);
      if (params.seller_id)
        queryParams.append('seller_id', String(params.seller_id));
      if (params.limit) queryParams.append('limit', String(params.limit));
      if (params.offset) queryParams.append('offset', String(params.offset));

      const url = `${
        process.env.NEXT_PUBLIC_HOST_BACK
      }/accounts?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch accounts');
      }
      const rawData = await response.json();

      const data: Account[] = rawData.map((item: RawAccount) => ({
        account_id: item.account_id,
        account_name: item.account_name,
        subcategory: item.subcategory,
        seller: item.seller,
        account_data: item.account_data,
        archive_link: item.archive_link,
        status: item.status,
        seller_id: item.seller.seller_id,
      }));

      set({ accounts: data, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  },

  fetchSellers: async (visibleInBot?: boolean) => {
    set({ loading: true, error: null });
    const accessToken = getCookie('access_token');
    if (!accessToken) {
      set({ loading: false, error: 'No access token found' });
      toast.error('No access token found');
      return;
    }

    try {
      const queryParams = new URLSearchParams();
      if (visibleInBot !== undefined)
        queryParams.append('visible_in_bot', String(visibleInBot));

      const url = `${
        process.env.NEXT_PUBLIC_HOST_BACK
      }/sellers?${queryParams.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch sellers');
      const data: Seller[] = await response.json();
      set({ sellers: data, loading: false });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  },

  fetchSalesAndYearlyChange: async (
    range: RangeType,
    customStart?: string,
    customEnd?: string,
    categoryId?: number,
    subcategoryId?: number
  ) => {
    set({ loading: true, error: null });
    try {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const last7DaysStart = new Date(today);
      last7DaysStart.setDate(today.getDate() - 6);
      const last7DaysStartStr = last7DaysStart.toISOString().split('T')[0];
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfMonthStr = startOfMonth.toISOString().split('T')[0];
      const startOfQuarter = new Date(
        today.getFullYear(),
        Math.floor(today.getMonth() / 3) * 3,
        1
      );
      const startOfQuarterStr = startOfQuarter.toISOString().split('T')[0];
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      const startOfYearStr = startOfYear.toISOString().split('T')[0];

      let reportType: ReportType;
      const currentParams: {
        date?: string;
        startDate?: string;
        endDate?: string;
      } = {};
      const lastYearParams: {
        date?: string;
        startDate?: string;
        endDate?: string;
      } = {};
      const params: { category_id?: number; subcategory_id?: number } = {};
      if (subcategoryId) params.subcategory_id = subcategoryId;
      else if (categoryId) params.category_id = categoryId;

      switch (range) {
        case 'today':
          reportType = 'hourly';
          currentParams.date = todayStr;
          lastYearParams.date = new Date(
            new Date(todayStr).setFullYear(new Date(todayStr).getFullYear() - 1)
          )
            .toISOString()
            .split('T')[0];
          break;
        case 'yesterday':
          reportType = 'hourly';
          currentParams.date = yesterdayStr;
          lastYearParams.date = new Date(
            new Date(yesterdayStr).setFullYear(
              new Date(yesterdayStr).getFullYear() - 1
            )
          )
            .toISOString()
            .split('T')[0];
          break;
        case 'week':
          reportType = 'daily';
          currentParams.startDate = last7DaysStartStr;
          currentParams.endDate = todayStr;
          lastYearParams.startDate = new Date(
            new Date(last7DaysStartStr).setFullYear(
              new Date(last7DaysStartStr).getFullYear() - 1
            )
          )
            .toISOString()
            .split('T')[0];
          lastYearParams.endDate = new Date(
            new Date(todayStr).setFullYear(new Date(todayStr).getFullYear() - 1)
          )
            .toISOString()
            .split('T')[0];
          break;
        case 'month':
          reportType = 'daily';
          currentParams.startDate = startOfMonthStr;
          currentParams.endDate = todayStr;
          lastYearParams.startDate = new Date(
            new Date(startOfMonthStr).setFullYear(
              new Date(startOfMonthStr).getFullYear() - 1
            )
          )
            .toISOString()
            .split('T')[0];
          lastYearParams.endDate = new Date(
            new Date(todayStr).setFullYear(new Date(todayStr).getFullYear() - 1)
          )
            .toISOString()
            .split('T')[0];
          break;
        case 'quarter':
          reportType = 'daily';
          currentParams.startDate = startOfQuarterStr;
          currentParams.endDate = todayStr;
          lastYearParams.startDate = new Date(
            new Date(startOfQuarterStr).setFullYear(
              new Date(startOfQuarterStr).getFullYear() - 1
            )
          )
            .toISOString()
            .split('T')[0];
          lastYearParams.endDate = new Date(
            new Date(todayStr).setFullYear(new Date(todayStr).getFullYear() - 1)
          )
            .toISOString()
            .split('T')[0];
          break;
        case 'year':
          reportType = 'monthly';
          currentParams.startDate = startOfYearStr;
          currentParams.endDate = todayStr;
          lastYearParams.startDate = new Date(
            new Date(startOfYearStr).setFullYear(
              new Date(startOfYearStr).getFullYear() - 1
            )
          )
            .toISOString()
            .split('T')[0];
          lastYearParams.endDate = new Date(
            new Date(todayStr).setFullYear(new Date(todayStr).getFullYear() - 1)
          )
            .toISOString()
            .split('T')[0];
          break;
        case 'custom':
          reportType = 'custom';
          currentParams.startDate = customStart!;
          currentParams.endDate = customEnd!;
          lastYearParams.startDate = new Date(
            new Date(customStart!).setFullYear(
              new Date(customStart!).getFullYear() - 1
            )
          )
            .toISOString()
            .split('T')[0];
          lastYearParams.endDate = new Date(
            new Date(customEnd!).setFullYear(
              new Date(customEnd!).getFullYear() - 1
            )
          )
            .toISOString()
            .split('T')[0];
          break;
      }

      const currentSales = await useSalesStore
        .getState()
        .fetchReport(reportType, { ...currentParams, ...params });
      const lastYearSales = await useSalesStore
        .getState()
        .fetchReport(reportType, { ...lastYearParams, ...params });

      let chartSales = currentSales;
      if (range === 'quarter') {
        const weeklyData: {
          [week: string]: { amount: number; quantity: number };
        } = {};
        currentSales.forEach(sale => {
          const date = new Date(sale.period);
          const year = date.getFullYear();
          const weekNumber =
            Math.floor((date.getDate() - 1 + ((date.getDay() + 6) % 7)) / 7) +
            1;
          const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
          if (!weeklyData[weekKey])
            weeklyData[weekKey] = { amount: 0, quantity: 0 };
          weeklyData[weekKey].amount += sale.amount;
          weeklyData[weekKey].quantity += sale.quantity;
        });
        chartSales = Object.entries(weeklyData).map(([period, data]) => ({
          period,
          amount: data.amount,
          quantity: data.quantity,
        }));
      }

      const currentTotalAmount = currentSales.reduce(
        (sum, sale) => sum + sale.amount,
        0
      );
      const lastYearTotalAmount = lastYearSales.reduce(
        (sum, sale) => sum + sale.amount,
        0
      );

      let change = 0;
      if (lastYearTotalAmount === 0) {
        change = currentTotalAmount > 0 ? 100 : 0;
      } else {
        change =
          ((currentTotalAmount - lastYearTotalAmount) / lastYearTotalAmount) *
          100;
      }

      set({
        chartSales,
        yearlyChange: Number(change.toFixed(1)),
        loading: false,
      });
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      toast.error(error instanceof Error ? error.message : 'Unknown error');
    }
  },
}));
