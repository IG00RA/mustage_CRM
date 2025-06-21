import { create } from 'zustand';
import { ENDPOINTS } from '../constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';
import {
  AllTimeReportResponse,
  RangeType,
  ReportParams,
  ReportType,
  Sale,
  SalesState,
  SalesSummaryResponse,
  AggregationType,
  ReportResponse,
} from '@/types/salesTypes';
import { useUsersStore } from '@/store/usersStore';
import {
  aggregateToMonthly,
  aggregateToWeekly,
  aggregateToYearly,
  getDateRangeParameters,
  getDaysDifference,
  isValidDateFormat,
  shiftYear,
} from '@/helpers/filterData';

interface ExtendedSalesState extends SalesState {
  setsDisplay: 'setsDisplayAcc' | 'setsDisplaySets';
  setSetsDisplay: (value: 'setsDisplayAcc' | 'setsDisplaySets') => void;
}

export const useSalesStore = create<ExtendedSalesState>(set => ({
  sales: [],
  chartSales: [],
  loading: false,
  error: null,
  dateRange: 'today',
  minDate: '2023-03-01',
  yearlyChange: null,
  customPeriodLabel: '',
  setsDisplay: 'setsDisplayAcc',
  setDateRange: (range: RangeType) => set({ dateRange: range }),
  setYearlyChange: (change: number) => set({ yearlyChange: change }),
  setCustomPeriodLabel: (period: string) => set({ customPeriodLabel: period }),
  setSetsDisplay: (value: 'setsDisplayAcc' | 'setsDisplaySets') =>
    set({ setsDisplay: value }),

  fetchSalesSummary: async (sellerIds?: string[]) => {
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
      if (sellerIds && sellerIds.length > 0) {
        queryParameters.append('seller_id', String(sellerIds[0]));
      } else if (!currentUser.is_admin && currentUser.seller?.seller_id) {
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
      if (sellerIds && sellerIds.length > 0) {
        allTimeQueryParameters.append('seller_id', String(sellerIds[0]));
      } else if (!currentUser.is_admin && currentUser.seller?.seller_id) {
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

      const { setsDisplay } = useSalesStore.getState();

      let allTimeQuantity = 0;
      let allTimeAmount = 0;
      Object.entries(allTimeData).forEach(([, months]) => {
        Object.entries(months).forEach(([month, report]) => {
          if (month !== 'total' && report) {
            const quantity =
              setsDisplay === 'setsDisplayAcc'
                ? (report.solo_accounts?.sales_count || 0) +
                  (report.sets?.accounts_sales_count || 0)
                : (report.solo_accounts?.sales_count || 0) +
                  (report.sets?.sets_sales_count || 0);
            const amount =
              (report.solo_accounts?.total_profit || 0) +
              (report.sets?.total_profit || 0);
            allTimeQuantity += quantity;
            allTimeAmount += amount;
          }
        });
      });

      const sales: Sale[] = [
        {
          period: 'Today',
          amount:
            (summaryData.today.solo_accounts?.total_profit || 0) +
            (summaryData.today.sets?.total_profit || 0),
          quantity:
            setsDisplay === 'setsDisplayAcc'
              ? (summaryData.today.solo_accounts?.sales_count || 0) +
                (summaryData.today.sets?.accounts_sales_count || 0)
              : (summaryData.today.solo_accounts?.sales_count || 0) +
                (summaryData.today.sets?.sets_sales_count || 0),
        },
        {
          period: 'Week',
          amount:
            (summaryData.week.solo_accounts?.total_profit || 0) +
            (summaryData.week.sets?.total_profit || 0),
          quantity:
            setsDisplay === 'setsDisplayAcc'
              ? (summaryData.week.solo_accounts?.sales_count || 0) +
                (summaryData.week.sets?.accounts_sales_count || 0)
              : (summaryData.week.solo_accounts?.sales_count || 0) +
                (summaryData.week.sets?.sets_sales_count || 0),
        },
        {
          period: 'Month',
          amount:
            (summaryData.month.solo_accounts?.total_profit || 0) +
            (summaryData.month.sets?.total_profit || 0),
          quantity:
            setsDisplay === 'setsDisplayAcc'
              ? (summaryData.month.solo_accounts?.sales_count || 0) +
                (summaryData.month.sets?.accounts_sales_count || 0)
              : (summaryData.month.solo_accounts?.sales_count || 0) +
                (summaryData.month.sets?.sets_sales_count || 0),
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

    if (parameters.seller_id) {
      queryParameters.append('seller_id', String(parameters.seller_id));
    } else if (!currentUser.is_admin && currentUser.seller?.seller_id) {
      queryParameters.append('seller_id', String(currentUser.seller.seller_id));
    }

    Object.entries(parameters).forEach(([key, value]) => {
      if (
        key !== 'category_id' &&
        key !== 'subcategory_id' &&
        key !== 'seller_id' &&
        value !== undefined
      ) {
        queryParameters.append(key, String(value));
      }
    });

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
    } else if (parameters.category_id) {
      if (Array.isArray(parameters.category_id)) {
        parameters.category_id.forEach(id => {
          queryParameters.append('category_id', String(id));
        });
      } else {
        queryParameters.append('category_id', String(parameters.category_id));
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
      const { setsDisplay } = useSalesStore.getState();

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
            if (
              month !== 'total' &&
              report &&
              report.solo_accounts &&
              report.sets
            ) {
              const quantity =
                setsDisplay === 'setsDisplayAcc'
                  ? (report.solo_accounts.sales_count || 0) +
                    (report.sets.accounts_sales_count || 0)
                  : (report.solo_accounts.sales_count || 0) +
                    (report.sets.sets_sales_count || 0);
              const amount =
                (report.solo_accounts.total_profit || 0) +
                (report.sets.total_profit || 0);
              sales.push({
                period: `${year}-${month.padStart(2, '0')}`,
                amount,
                quantity,
              });
            }
          });
        });
        return sales.sort((a, b) => a.period.localeCompare(b.period));
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

      return Object.entries(data)
        .map(([period, report]) => {
          if (report && report.solo_accounts && report.sets) {
            const quantity =
              setsDisplay === 'setsDisplayAcc'
                ? (report.solo_accounts.sales_count || 0) +
                  (report.sets.accounts_sales_count || 0)
                : (report.solo_accounts.sales_count || 0) +
                  (report.sets.sets_sales_count || 0);
            const amount =
              (report.solo_accounts.total_profit || 0) +
              (report.sets.total_profit || 0);
            return {
              period,
              amount,
              quantity,
            };
          }
          return null;
        })
        .filter((sale): sale is Sale => sale !== null)
        .sort((a, b) => a.period.localeCompare(b.period));
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
    subcategoryId?: number | number[],
    sellerIds?: string[],
    aggregationType?: AggregationType
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

      if (sellerIds && sellerIds.length > 0) {
        currentParameters.seller_id = sellerIds[0];
        lastYearParameters.seller_id = sellerIds[0];
      }

      const currentSales = await useSalesStore
        .getState()
        .fetchReport(reportType, currentParameters);

      let yearlyChange: number | null = null;
      let chartSales: Sale[] = currentSales;

      if (range === 'all' && aggregationType) {
        chartSales =
          aggregationType === 'monthly'
            ? aggregateToMonthly(currentSales)
            : aggregateToYearly(currentSales);
        yearlyChange = null;
      } else if (range !== 'all') {
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
              : range === 'year'
              ? aggregateToMonthly(currentSales)
              : currentSales;
        }

        const currentTotal = currentSales.reduce(
          (sum, sale) => sum + (sale.amount || 0),
          0
        );
        const lastYearTotal = lastYearSales.reduce(
          (sum, sale) => sum + (sale.amount || 0),
          0
        );
        yearlyChange =
          lastYearTotal === 0
            ? currentTotal > 0
              ? 100
              : 0
            : ((currentTotal - lastYearTotal) / lastYearTotal) * 100;
      } else {
        chartSales = [];
        yearlyChange = null;
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
      set({ loading: false, error: errorMessage, chartSales: [] });
    }
  },
}));
