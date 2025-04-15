export interface Sale {
  period: string;
  amount: number;
  quantity: number;
}

export type RangeType =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'custom'
  | 'all';

export type ReportType =
  | 'hourly'
  | 'daily'
  | 'monthly'
  | 'yearly'
  | 'custom'
  | 'all';

export interface ReportParams {
  date?: string;
  start_date?: string;
  end_date?: string;
  category_id?: number | number[];
  subcategory_id?: number | number[];
}

export interface DateRangeResult {
  reportType: ReportType;
  current: ReportParams;
  lastYear: ReportParams;
}

export interface SummaryPeriod {
  total_amount: number;
  sales_count: number;
}

export interface SalesSummaryResponse {
  today: SummaryPeriod;
  week: SummaryPeriod;
  month: SummaryPeriod;
}

export interface YearlyTotal {
  total_amount: number;
  sales_count: number;
}

export interface SalesAllTimeResponse {
  [year: string]: {
    total: YearlyTotal;
  };
}

export interface ReportPeriod {
  total_amount: number;
  sales_count: number;
}

export interface ReportResponse {
  [period: string]: ReportPeriod;
}

export interface AllTimeReportResponse {
  [year: string]: {
    [month: string]:
      | ReportPeriod
      | { total_amount: number; sales_count: number };
  };
}

export interface SalesState {
  sales: Sale[];
  chartSales: Sale[];
  loading: boolean;
  error: string | null;
  dateRange: RangeType;
  yearlyChange: number | null;
  minDate: string | null;
  customPeriodLabel: string;
  setDateRange: (range: RangeType) => void;
  setYearlyChange: (change: number) => void;
  setCustomPeriodLabel: (period: string) => void;
  fetchSalesSummary: () => Promise<void>;
  fetchReport: (
    reportType: ReportType,
    params: ReportParams
  ) => Promise<Sale[]>;
  fetchSalesAndYearlyChange: (
    range: RangeType,
    customStart?: string,
    customEnd?: string,
    categoryId?: number | number[],
    subcategoryId?: number | number[]
  ) => Promise<void>;
}
