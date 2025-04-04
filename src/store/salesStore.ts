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
    all: {
      reportType: 'all',
      current: {},
      lastYear: {},
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

const getDaysDifference = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffInMs = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24)); // Переводимо мілісекунди в дні
};

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

const aggregateToMonthly = (sales: Sale[]): Sale[] => {
  const monthlyData: { [month: string]: { amount: number; quantity: number } } =
    {};
  sales.forEach(sale => {
    const date = new Date(sale.period);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;
    monthlyData[monthKey] = monthlyData[monthKey] || { amount: 0, quantity: 0 };
    monthlyData[monthKey].amount += sale.amount;
    monthlyData[monthKey].quantity += sale.quantity;
  });
  return Object.entries(monthlyData).map(([period, data]) => ({
    period,
    amount: data.amount,
    quantity: data.quantity,
  }));
};

const aggregateToYearly = (sales: Sale[]): Sale[] => {
  const yearlyData: { [year: string]: { amount: number; quantity: number } } =
    {};
  sales.forEach(sale => {
    const date = new Date(sale.period);
    const yearKey = `${date.getFullYear()}`;
    yearlyData[yearKey] = yearlyData[yearKey] || { amount: 0, quantity: 0 };
    yearlyData[yearKey].amount += sale.amount;
    yearlyData[yearKey].quantity += sale.quantity;
  });
  return Object.entries(yearlyData).map(([period, data]) => ({
    period,
    amount: data.amount,
    quantity: data.quantity,
  }));
};

export const useSalesStore = create<SalesState>(set => ({
  sales: [],
  chartSales: [],
  loading: false,
  error: null,
  dateRange: 'today',
  minDate: '2023-03-01',
  yearlyChange: null,
  customPeriodLabel: '',
  setDateRange: range => set({ dateRange: range }),
  setYearlyChange: change => set({ yearlyChange: change }),
  setCustomPeriodLabel: period => set({ customPeriodLabel: period }),

  fetchSalesSummary: async () => {
    const summaryData = await fetchWithErrorHandling<any>(
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

    const allTimeData = await fetchWithErrorHandling<any>(
      ENDPOINTS.SALES_ALL_TIME,
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

    let allTimeQuantity = 0;
    let allTimeAmount = 0;
    Object.values(allTimeData).forEach((yearData: any) => {
      if (yearData.total) {
        allTimeQuantity += yearData.total.sales_count || 0;
        allTimeAmount += yearData.total.total_amount || 0;
      }
    });

    const sales: Sale[] = [
      {
        period: 'Today',
        amount: summaryData.today.total_amount,
        quantity: summaryData.today.sales_count,
      },
      {
        period: 'Week',
        amount: summaryData.week.total_amount,
        quantity: summaryData.week.sales_count,
      },
      {
        period: 'Month',
        amount: summaryData.month.total_amount,
        quantity: summaryData.month.sales_count,
      },
      {
        period: 'AllTime',
        amount: allTimeAmount,
        quantity: allTimeQuantity,
      },
    ];

    set({ sales });
  },

  fetchReport: async (reportType, params) => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (
        key !== 'category_id' &&
        key !== 'subcategory_id' &&
        value !== undefined
      ) {
        queryParams.append(key, String(value));
      }
    });

    if (params.category_id && Array.isArray(params.category_id)) {
      params.category_id.forEach((id: number) => {
        queryParams.append('category_id', String(id));
      });
    } else if (params.category_id) {
      queryParams.append('category_id', String(params.category_id));
    }

    if (params.subcategory_id && Array.isArray(params.subcategory_id)) {
      params.subcategory_id.forEach((id: number) => {
        queryParams.append('subcategory_id', String(id));
      });
    } else if (params.subcategory_id) {
      queryParams.append('subcategory_id', String(params.subcategory_id));
    }

    const query = queryParams.toString();
    let endpoint: string;

    switch (reportType) {
      case 'hourly':
        endpoint = `${ENDPOINTS.SALES_HOURLY}${query ? `?${query}` : ''}`;
        break;
      case 'daily':
        endpoint = `${ENDPOINTS.SALES_DAILY}${query ? `?${query}` : ''}`;
        break;
      case 'monthly':
        endpoint = `${ENDPOINTS.SALES_MONTHLY}${query ? `?${query}` : ''}`;
        break;
      case 'yearly':
        endpoint = `${ENDPOINTS.SALES_YEARLY}${query ? `?${query}` : ''}`;
        break;
      case 'all':
        endpoint = `${ENDPOINTS.SALES_ALL_TIME}${query ? `?${query}` : ''}`;
        break;
      default:
        endpoint = `${ENDPOINTS.SALES_DAILY}${query ? `?${query}` : ''}`;
    }

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

    if (reportType === 'all') {
      const sales: Sale[] = [];
      Object.entries(data).forEach(([year, months]: [string, any]) => {
        Object.entries(months).forEach(([month, report]: [string, any]) => {
          if (month !== 'total') {
            sales.push({
              period: `${year}-${month}`,
              amount: report.total_amount || 0,
              quantity: report.sales_count || 0,
            });
          }
        });
      });
      return sales;
    }

    return Object.entries(data).map(([period, report]: [string, any]) => ({
      period,
      amount: report.total_amount || 0,
      quantity: report.sales_count || 0,
    }));
  },

  fetchSalesAndYearlyChange: async (
    range: RangeType,
    customStart?: string,
    customEnd?: string,
    categoryId?: number | number[],
    subcategoryId?: number | number[]
  ) => {
    let reportType: ReportType;
    let currentParams: Record<string, string | string[]> = {};
    let lastYearParams: Record<string, string | string[]> = {};

    if (range === 'custom') {
      // Отримуємо дати з параметрів або з customPeriodLabel
      let effectiveStart = customStart;
      let effectiveEnd = customEnd;

      if (
        !effectiveStart ||
        !effectiveEnd ||
        !isValidDateFormat(effectiveStart) ||
        !isValidDateFormat(effectiveEnd)
      ) {
        const label = useSalesStore.getState().customPeriodLabel;
        const dates = label.split(' - ');
        if (
          dates.length === 2 &&
          isValidDateFormat(dates[0]) &&
          isValidDateFormat(dates[1])
        ) {
          effectiveStart = dates[0];
          effectiveEnd = dates[1];
        } else {
          // Якщо дати невалідні або відсутні, очищаємо графік і виходимо
          set({ chartSales: [], yearlyChange: null });
          return;
        }
      }

      // На цьому етапі effectiveStart і effectiveEnd точно є валідними рядками
      const daysDiff = getDaysDifference(effectiveStart, effectiveEnd);
      if (daysDiff <= 1) {
        reportType = 'hourly';
        currentParams = { date: effectiveStart };
        lastYearParams = { date: shiftYear(effectiveStart) };
      } else {
        reportType = 'daily';
        currentParams = { start_date: effectiveStart, end_date: effectiveEnd };
        lastYearParams = {
          start_date: shiftYear(effectiveStart),
          end_date: shiftYear(effectiveEnd),
        };
      }
    } else {
      const {
        reportType: predefinedReportType,
        current,
        lastYear,
      } = getDateRangeParams(range, customStart, customEnd);
      reportType = predefinedReportType;
      currentParams = { ...current };
      lastYearParams = { ...lastYear };
    }

    // Додаємо categoryId і subcategoryId, якщо вони є
    if (categoryId !== undefined) {
      if (Array.isArray(categoryId) && categoryId.length > 0) {
        currentParams.category_id = categoryId.map(String);
        lastYearParams.category_id = categoryId.map(String);
      } else if (!Array.isArray(categoryId)) {
        currentParams.category_id = String(categoryId);
        lastYearParams.category_id = String(categoryId);
      }
    }

    if (subcategoryId !== undefined) {
      if (Array.isArray(subcategoryId) && subcategoryId.length > 0) {
        currentParams.subcategory_id = subcategoryId.map(String);
        lastYearParams.subcategory_id = subcategoryId.map(String);
      } else if (!Array.isArray(subcategoryId)) {
        currentParams.subcategory_id = String(subcategoryId);
        lastYearParams.subcategory_id = String(subcategoryId);
      }
    }

    // Виконуємо запити до сервера
    const currentSales = await useSalesStore
      .getState()
      .fetchReport(reportType, currentParams);

    let yearlyChange: number | null = null;
    let chartSales = currentSales;

    if (range !== 'all') {
      const lastYearSales = await useSalesStore
        .getState()
        .fetchReport(reportType, lastYearParams);

      if (range === 'custom') {
        const daysDiff = getDaysDifference(
          (currentParams.start_date as string) ||
            (currentParams.date as string),
          (currentParams.end_date as string) || (currentParams.date as string)
        );
        if (daysDiff <= 1) {
          chartSales = currentSales;
        } else if (daysDiff <= 31) {
          chartSales = currentSales;
        } else if (daysDiff <= 180) {
          chartSales = aggregateToWeekly(currentSales);
        } else if (daysDiff <= 6 * 365) {
          chartSales = aggregateToMonthly(currentSales);
        } else {
          chartSales = aggregateToYearly(currentSales);
        }
      } else {
        chartSales =
          range === 'quarter' ? aggregateToWeekly(currentSales) : currentSales;
      }

      const currentTotal = currentSales.reduce(
        (sum, sale) => sum + sale.amount,
        0
      );
      const lastYearTotal = lastYearSales.reduce(
        (sum, sale) => sum + sale.amount,
        0
      );
      yearlyChange =
        lastYearTotal === 0
          ? currentTotal > 0
            ? 100
            : 0
          : ((currentTotal - lastYearTotal) / lastYearTotal) * 100;
    }

    set({
      chartSales,
      yearlyChange:
        yearlyChange !== null ? Number(yearlyChange.toFixed(1)) : null,
    });
  },
}));
