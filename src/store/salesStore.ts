import { create } from 'zustand';
import { ENDPOINTS } from '../constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';
import {
  AllTimeReportResponse,
  DateRangeResult,
  RangeType,
  ReportParams,
  ReportResponse,
  ReportType,
  Sale,
  SalesState,
  SalesSummaryResponse,
} from '@/types/salesTypes';
import { useUsersStore } from '@/store/usersStore';

const getDateRangeParameters = (
  range: RangeType,
  customStartDate?: string,
  customEndDate?: string
): DateRangeResult => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];
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

  const ranges: Record<RangeType, DateRangeResult> = {
    today: {
      reportType: 'hourly',
      current: { date: todayString },
      lastYear: { date: shiftYear(todayString) },
    },
    yesterday: {
      reportType: 'hourly',
      current: { date: yesterday },
      lastYear: { date: shiftYear(yesterday) },
    },
    week: {
      reportType: 'daily',
      current: { start_date: last7DaysStart, end_date: todayString },
      lastYear: {
        start_date: shiftYear(last7DaysStart),
        end_date: shiftYear(todayString),
      },
    },
    month: {
      reportType: 'daily',
      current: { start_date: startOfMonth, end_date: todayString },
      lastYear: {
        start_date: shiftYear(startOfMonth),
        end_date: shiftYear(todayString),
      },
    },
    quarter: {
      reportType: 'daily',
      current: { start_date: startOfQuarter, end_date: todayString },
      lastYear: {
        start_date: shiftYear(startOfQuarter),
        end_date: shiftYear(todayString),
      },
    },
    year: {
      reportType: 'monthly',
      current: { start_date: startOfYear, end_date: todayString },
      lastYear: {
        start_date: shiftYear(startOfYear),
        end_date: shiftYear(todayString),
      },
    },
    custom: {
      reportType: 'custom',
      current: { start_date: customStartDate, end_date: customEndDate },
      lastYear: {
        start_date: shiftYear(customStartDate!),
        end_date: shiftYear(customEndDate!),
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
  if (!date || !isValidDateFormat(date)) {
    return new Date().toISOString().split('T')[0];
  }
  return new Date(new Date(date).setFullYear(new Date(date).getFullYear() - 1))
    .toISOString()
    .split('T')[0];
};

const isValidDateFormat = (date: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) {
    return false;
  }
  const [year, month, day] = date.split('-').map(Number);
  const dateObject = new Date(year, month - 1, day);
  return (
    dateObject.getFullYear() === year &&
    dateObject.getMonth() === month - 1 &&
    dateObject.getDate() === day
  );
};

const getDaysDifference = (start: string, end: string): number => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const differenceInMilliseconds = endDate.getTime() - startDate.getTime();
  return Math.ceil(differenceInMilliseconds / (1000 * 60 * 60 * 24));
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
  setDateRange: (range: RangeType) => set({ dateRange: range }),
  setYearlyChange: (change: number) => set({ yearlyChange: change }),
  setCustomPeriodLabel: (period: string) => set({ customPeriodLabel: period }),

  fetchSalesSummary: async () => {
    const usersStore = useUsersStore.getState();
    let { currentUser } = usersStore;

    if (!currentUser) {
      try {
        currentUser = await usersStore.fetchCurrentUser();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({ loading: false, error: errorMessage, sales: [] });
        return;
      }
    }

    if (
      !currentUser.is_admin &&
      (!currentUser.seller || !currentUser.seller.seller_id)
    ) {
      set({ sales: [], loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      const queryParameters = new URLSearchParams();
      if (!currentUser.is_admin && currentUser.seller?.seller_id) {
        queryParameters.append(
          'seller_id',
          String(currentUser.seller.seller_id)
        );
      }

      const summaryEndpoint = `${ENDPOINTS.SALES_SUMMARY}${
        queryParameters.toString() ? `?${queryParameters.toString()}` : ''
      }`;

      const summaryData = await fetchWithErrorHandling<SalesSummaryResponse>(
        summaryEndpoint,
        {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
        () => {}
      );

      const allTimeQueryParameters = new URLSearchParams();
      if (!currentUser.is_admin && currentUser.seller?.seller_id) {
        allTimeQueryParameters.append(
          'seller_id',
          String(currentUser.seller.seller_id)
        );
      }

      const allTimeEndpoint = `${ENDPOINTS.SALES_ALL_TIME}${
        allTimeQueryParameters.toString()
          ? `?${allTimeQueryParameters.toString()}`
          : ''
      }`;

      const allTimeData = await fetchWithErrorHandling<AllTimeReportResponse>(
        allTimeEndpoint,
        {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
        () => {}
      );

      let allTimeQuantity = 0;
      let allTimeAmount = 0;
      Object.entries(allTimeData).forEach(([, months]) => {
        Object.entries(months).forEach(([, report]) => {
          allTimeQuantity += report.solo_accounts.sales_count || 0;
          allTimeAmount += report.solo_accounts.total_profit || 0;
        });
      });

      const sales: Sale[] = [
        {
          period: 'Today',
          amount: summaryData.today.solo_accounts.total_profit,
          quantity: summaryData.today.solo_accounts.sales_count,
        },
        {
          period: 'Week',
          amount: summaryData.week.solo_accounts.total_profit,
          quantity: summaryData.week.solo_accounts.sales_count,
        },
        {
          period: 'Month',
          amount: summaryData.month.solo_accounts.total_profit,
          quantity: summaryData.month.solo_accounts.sales_count,
        },
        {
          period: 'AllTime',
          amount: allTimeAmount,
          quantity: allTimeQuantity,
        },
      ];

      set({ sales, loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
    }
  },

  fetchReport: async (
    reportType: ReportType,
    parameters: ReportParams
  ): Promise<Sale[]> => {
    const usersStore = useUsersStore.getState();
    let { currentUser } = usersStore;

    if (!currentUser) {
      try {
        currentUser = await usersStore.fetchCurrentUser();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({ loading: false, error: errorMessage });
        return [];
      }
    }

    if (
      !currentUser.is_admin &&
      (!currentUser.seller || !currentUser.seller.seller_id)
    ) {
      return [];
    }

    const queryParameters = new URLSearchParams();

    if (!currentUser.is_admin && currentUser.seller?.seller_id) {
      queryParameters.append('seller_id', String(currentUser.seller.seller_id));
    }

    Object.entries(parameters).forEach(([key, value]) => {
      if (
        key !== 'category_id' &&
        key !== 'subcategory_id' &&
        value !== undefined
      ) {
        queryParameters.append(key, String(value));
      }
    });

    if (parameters.category_id) {
      if (Array.isArray(parameters.category_id)) {
        parameters.category_id.forEach(id => {
          queryParameters.append('category_id', String(id));
        });
      } else {
        queryParameters.append('category_id', String(parameters.category_id));
      }
    }

    if (parameters.subcategory_id) {
      if (Array.isArray(parameters.subcategory_id)) {
        parameters.subcategory_id.forEach(id => {
          queryParameters.append('subcategory_id', String(id));
        });
      } else {
        queryParameters.append(
          'subcategory_id',
          String(parameters.subcategory_id)
        );
      }
    }

    const queryString = queryParameters.toString();
    let endpoint: string;

    switch (reportType) {
      case 'hourly':
        endpoint = `${ENDPOINTS.SALES_HOURLY}${
          queryString ? `?${queryString}` : ''
        }`;
        break;
      case 'daily':
        endpoint = `${ENDPOINTS.SALES_DAILY}${
          queryString ? `?${queryString}` : ''
        }`;
        break;
      case 'monthly':
        endpoint = `${ENDPOINTS.SALES_MONTHLY}${
          queryString ? `?${queryString}` : ''
        }`;
        break;
      case 'yearly':
        endpoint = `${ENDPOINTS.SALES_YEARLY}${
          queryString ? `?${queryString}` : ''
        }`;
        break;
      case 'all':
        endpoint = `${ENDPOINTS.SALES_ALL_TIME}${
          queryString ? `?${queryString}` : ''
        }`;
        break;
      default:
        endpoint = `${ENDPOINTS.SALES_DAILY}${
          queryString ? `?${queryString}` : ''
        }`;
    }

    try {
      if (reportType === 'all') {
        const data = await fetchWithErrorHandling<AllTimeReportResponse>(
          endpoint,
          {
            method: 'GET',
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          },
          () => {}
        );

        const sales: Sale[] = [];
        Object.entries(data).forEach(([year, months]) => {
          Object.entries(months).forEach(([month, report]) => {
            sales.push({
              period: `${year}-${month}`,
              amount: report.solo_accounts.total_profit || 0,
              quantity: report.solo_accounts.sales_count || 0,
            });
          });
        });
        return sales;
      }

      const data = await fetchWithErrorHandling<ReportResponse>(
        endpoint,
        {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
        () => {}
      );

      return Object.entries(data).map(([period, report]) => ({
        period,
        amount: report.solo_accounts.total_profit || 0,
        quantity: report.solo_accounts.sales_count || 0,
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      return [];
    }
  },

  fetchSalesAndYearlyChange: async (
    range: RangeType,
    customStartDate?: string,
    customEndDate?: string,
    categoryId?: number | number[],
    subcategoryId?: number | number[]
  ): Promise<void> => {
    const usersStore = useUsersStore.getState();
    let { currentUser } = usersStore;

    if (!currentUser) {
      try {
        currentUser = await usersStore.fetchCurrentUser();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        set({
          loading: false,
          error: errorMessage,
          chartSales: [],
          yearlyChange: null,
        });
        return;
      }
    }

    if (
      !currentUser.is_admin &&
      (!currentUser.seller || !currentUser.seller.seller_id)
    ) {
      set({ chartSales: [], yearlyChange: null, loading: false });
      return;
    }

    set({ loading: true, error: null });
    try {
      let reportType: ReportType;
      let currentParameters: ReportParams = {};
      let lastYearParameters: ReportParams = {};

      if (range === 'custom') {
        let effectiveStartDate = customStartDate;
        let effectiveEndDate = customEndDate;

        if (
          !effectiveStartDate ||
          !effectiveEndDate ||
          !isValidDateFormat(effectiveStartDate) ||
          !isValidDateFormat(effectiveEndDate)
        ) {
          const customPeriodLabel = useSalesStore.getState().customPeriodLabel;
          const dates = customPeriodLabel.split(' - ');
          if (
            dates.length === 2 &&
            isValidDateFormat(dates[0]) &&
            isValidDateFormat(dates[1])
          ) {
            effectiveStartDate = dates[0];
            effectiveEndDate = dates[1];
          } else {
            set({ chartSales: [], yearlyChange: null, loading: false });
            return;
          }
        }

        const daysDifference = getDaysDifference(
          effectiveStartDate,
          effectiveEndDate
        );
        if (daysDifference <= 1) {
          reportType = 'hourly';
          currentParameters = { date: effectiveStartDate };
          lastYearParameters = { date: shiftYear(effectiveStartDate) };
        } else {
          reportType = 'daily';
          currentParameters = {
            start_date: effectiveStartDate,
            end_date: effectiveEndDate,
          };
          lastYearParameters = {
            start_date: shiftYear(effectiveStartDate),
            end_date: shiftYear(effectiveEndDate),
          };
        }
      } else {
        const {
          reportType: predefinedReportType,
          current,
          lastYear,
        } = getDateRangeParameters(range, customStartDate, customEndDate);
        reportType = predefinedReportType;
        currentParameters = current;
        lastYearParameters = lastYear;
      }

      if (categoryId !== undefined) {
        currentParameters.category_id = categoryId;
        lastYearParameters.category_id = categoryId;
      }

      if (subcategoryId !== undefined) {
        currentParameters.subcategory_id = subcategoryId;
        lastYearParameters.subcategory_id = subcategoryId;
      }

      const currentSales = await useSalesStore
        .getState()
        .fetchReport(reportType, currentParameters);

      let yearlyChange: number | null = null;
      let chartSales = currentSales;

      if (range !== 'all') {
        const lastYearSales = await useSalesStore
          .getState()
          .fetchReport(reportType, lastYearParameters);

        if (range === 'custom') {
          const daysDifference = getDaysDifference(
            currentParameters.start_date || currentParameters.date || '',
            currentParameters.end_date || currentParameters.date || ''
          );
          if (daysDifference <= 1) {
            chartSales = currentSales;
          } else if (daysDifference <= 31) {
            chartSales = currentSales;
          } else if (daysDifference <= 180) {
            chartSales = aggregateToWeekly(currentSales);
          } else if (daysDifference <= 6 * 365) {
            chartSales = aggregateToMonthly(currentSales);
          } else {
            chartSales = aggregateToYearly(currentSales);
          }
        } else {
          chartSales =
            range === 'quarter'
              ? aggregateToWeekly(currentSales)
              : currentSales;
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
        loading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
    }
  },
}));
