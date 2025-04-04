import { create } from 'zustand';
import { Sale, RangeType, ReportType, SalesState } from '../types/salesTypes';
import { ENDPOINTS } from '../constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';

const getDateRangeParams = (
  range: RangeType,
  customStart?: string,
  customEnd?: string
) => {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today.setDate(today.getDate() - 1))
    .toISOString()
    .split('T')[0];
  const last7DaysStart = new Date(today.setDate(today.getDate() - 6))
    .toISOString()
    .split('T')[0];
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    .toISOString()
    .split('T')[0];
  const startOfQuarter = new Date(
    today.getFullYear(),
    Math.floor(today.getMonth() / 3) * 3,
    1
  )
    .toISOString()
    .split('T')[0];
  const startOfYear = new Date(today.getFullYear(), 0, 1)
    .toISOString()
    .split('T')[0];

  const ranges: Record<
    RangeType,
    { reportType: ReportType; current: any; lastYear: any }
  > = {
    today: {
      reportType: 'hourly',
      current: { date: todayStr },
      lastYear: { date: shiftYear(todayStr) },
    },
    yesterday: {
      reportType: 'hourly',
      current: { date: yesterday },
      lastYear: { date: shiftYear(yesterday) },
    },
    week: {
      reportType: 'daily',
      current: { start_date: last7DaysStart, end_date: todayStr },
      lastYear: {
        start_date: shiftYear(last7DaysStart),
        end_date: shiftYear(todayStr),
      },
    },
    month: {
      reportType: 'daily',
      current: { start_date: startOfMonth, end_date: todayStr },
      lastYear: {
        start_date: shiftYear(startOfMonth),
        end_date: shiftYear(todayStr),
      },
    },
    quarter: {
      reportType: 'daily',
      current: { start_date: startOfQuarter, end_date: todayStr },
      lastYear: {
        start_date: shiftYear(startOfQuarter),
        end_date: shiftYear(todayStr),
      },
    },
    year: {
      reportType: 'monthly',
      current: { start_date: startOfYear, end_date: todayStr },
      lastYear: {
        start_date: shiftYear(startOfYear),
        end_date: shiftYear(todayStr),
      },
    },
    custom: {
      reportType: 'custom',
      current: { start_date: customStart, end_date: customEnd },
      lastYear: {
        start_date: shiftYear(customStart!),
        end_date: shiftYear(customEnd!),
      },
    },
  };
  return ranges[range];
};

const shiftYear = (date: string): string => {
  if (!date || !isValidDateFormat(date))
    return new Date().toISOString().split('T')[0];
  return new Date(new Date(date).setFullYear(new Date(date).getFullYear() - 1))
    .toISOString()
    .split('T')[0];
};

const isValidDateFormat = (date: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  const [year, month, day] = date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return (
    dateObj.getFullYear() === year &&
    dateObj.getMonth() === month - 1 &&
    dateObj.getDate() === day
  );
};

export const useSalesStore = create<SalesState>(set => ({
  sales: [],
  chartSales: [],
  loading: false,
  error: null,
  dateRange: 'today',
  yearlyChange: null,
  customPeriodLabel: '',
  setDateRange: range => set({ dateRange: range }),
  setYearlyChange: change => set({ yearlyChange: change }),
  setCustomPeriodLabel: period => set({ customPeriodLabel: period }),

  fetchSalesSummary: async () => {
    const data = await fetchWithErrorHandling<any>(
      ENDPOINTS.SALES_SUMMARY,
      {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
      set
    );
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
    set({ sales });
  },

  fetchReport: async (reportType, params) => {
    const queryParams = new URLSearchParams();

    // Додаємо параметри дати
    Object.entries(params).forEach(([key, value]) => {
      if (
        key !== 'category_id' &&
        key !== 'subcategory_id' &&
        value !== undefined
      ) {
        queryParams.append(key, String(value));
      }
    });

    // Додаємо category_id як окремі параметри
    if (params.category_id && Array.isArray(params.category_id)) {
      params.category_id.forEach((id: number) => {
        queryParams.append('category_id', String(id));
      });
    } else if (params.category_id) {
      queryParams.append('category_id', String(params.category_id));
    }

    // Додаємо subcategory_id як окремі параметри
    if (params.subcategory_id && Array.isArray(params.subcategory_id)) {
      params.subcategory_id.forEach((id: number) => {
        queryParams.append('subcategory_id', String(id));
      });
    } else if (params.subcategory_id) {
      queryParams.append('subcategory_id', String(params.subcategory_id));
    }

    const query = queryParams.toString();
    const endpoint =
      reportType === 'hourly'
        ? `${ENDPOINTS.SALES_HOURLY}${query ? `?${query}` : ''}`
        : reportType === 'daily'
        ? `${ENDPOINTS.SALES_DAILY}${query ? `?${query}` : ''}`
        : reportType === 'monthly'
        ? `${ENDPOINTS.SALES_MONTHLY}${query ? `?${query}` : ''}`
        : reportType === 'yearly'
        ? `${ENDPOINTS.SALES_YEARLY}${query ? `?${query}` : ''}`
        : `${ENDPOINTS.SALES_DAILY}${query ? `?${query}` : ''}`;

    const data = await fetchWithErrorHandling<any>(
      endpoint,
      {
        method: 'GET',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
      set
    );
    return Object.entries(data).map(([period, report]: [string, any]) => ({
      period,
      amount: report.total_amount,
      quantity: report.sales_count,
    }));
  },

  fetchSalesAndYearlyChange: async (
    range,
    customStart,
    customEnd,
    categoryId?,
    subcategoryId?
  ) => {
    const { reportType, current, lastYear } = getDateRangeParams(
      range,
      customStart,
      customEnd
    );
    const params: Record<string, string | string[]> = {};

    // Обробка categoryId
    if (categoryId !== undefined) {
      if (Array.isArray(categoryId)) {
        if (categoryId.length > 0) {
          params.category_id = categoryId.map(String);
        }
      } else {
        params.category_id = String(categoryId);
      }
    }

    // Обробка subcategoryId
    if (subcategoryId !== undefined) {
      if (Array.isArray(subcategoryId)) {
        if (subcategoryId.length > 0) {
          params.subcategory_id = subcategoryId.map(String);
        }
      } else {
        params.subcategory_id = String(subcategoryId);
      }
    }

    const currentSales = await useSalesStore
      .getState()
      .fetchReport(reportType, { ...current, ...params });
    const lastYearSales = await useSalesStore
      .getState()
      .fetchReport(reportType, { ...lastYear, ...params });

    const chartSales =
      range === 'quarter' ? aggregateToWeekly(currentSales) : currentSales;
    const currentTotal = currentSales.reduce(
      (sum, sale) => sum + sale.amount,
      0
    );
    const lastYearTotal = lastYearSales.reduce(
      (sum, sale) => sum + sale.amount,
      0
    );
    const yearlyChange =
      lastYearTotal === 0
        ? currentTotal > 0
          ? 100
          : 0
        : ((currentTotal - lastYearTotal) / lastYearTotal) * 100;

    set({ chartSales, yearlyChange: Number(yearlyChange.toFixed(1)) });
  },
}));

const aggregateToWeekly = (sales: Sale[]): Sale[] => {
  const weeklyData: { [week: string]: { amount: number; quantity: number } } =
    {};
  sales.forEach(sale => {
    const date = new Date(sale.period);
    const year = date.getFullYear();
    const weekNumber =
      Math.floor((date.getDate() - 1 + ((date.getDay() + 6) % 7)) / 7) + 1;
    const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
    weeklyData[weekKey] = weeklyData[weekKey] || { amount: 0, quantity: 0 };
    weeklyData[weekKey].amount += sale.amount;
    weeklyData[weekKey].quantity += sale.quantity;
  });
  return Object.entries(weeklyData).map(([period, data]) => ({
    period,
    amount: data.amount,
    quantity: data.quantity,
  }));
};
