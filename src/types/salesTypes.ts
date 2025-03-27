export interface Sale {
  period: string;
  amount: number;
  quantity: number;
}

export interface Category {
  account_category_id: number;
  account_category_name: string;
  description: string | null;
  is_set_category: boolean;
}

export interface Subcategory {
  account_subcategory_id: number;
  account_subcategory_name: string;
  account_category_id: number;
  price: number;
  cost_price: number;
  description: string | null;
  output_format_field?: string[];
  output_separator?: string;
}

export interface Account {
  account_id: number;
  upload_datetime: string;
  sold_datetime: string | null;
  worker_name: string;
  teamlead_name: string;
  client_name: string;
  account_name: string;
  price: number;
  status: string;
  frozen_at: string | null;
  replace_reason: string | null;
  profile_link: string;
  archive_link: string;
  account_data: string;
  isTransferred?: boolean | null;
  seller: Seller;
  subcategory: Subcategory;
  destination: {
    destination_id: number;
    browser_id: number;
    username: string;
    browser: { browser_id: number; browser_name: string };
  };
}

export interface Seller {
  seller_id: number;
  seller_name: string;
  visible_in_bot: boolean;
}

export interface Response<T> {
  total_rows: number;
  returned: number;
  offset: number;
  limit: number;
  items: T[];
}

export type RangeType =
  | 'today'
  | 'yesterday'
  | 'week'
  | 'month'
  | 'quarter'
  | 'year'
  | 'custom';

export type ReportType = 'hourly' | 'daily' | 'monthly' | 'yearly' | 'custom';

export interface SalesState {
  sales: Sale[];
  chartSales: Sale[];
  loading: boolean;
  error: string | null;
  dateRange: RangeType;
  yearlyChange: number | null;
  customPeriodLabel: string;
  setDateRange: (range: RangeType) => void;
  setYearlyChange: (change: number) => void;
  setCustomPeriodLabel: (period: string) => void;
  fetchSalesSummary: () => Promise<void>;
  fetchReport: (reportType: ReportType, params: any) => Promise<Sale[]>;
  fetchSalesAndYearlyChange: (
    range: RangeType,
    customStart?: string,
    customEnd?: string,
    categoryId?: number | number[],
    subcategoryId?: number | number[]
  ) => Promise<void>;
}

export interface CategoriesState {
  categories: Category[];
  subcategories: Subcategory[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  fetchSubcategories: (categoryId?: number) => Promise<void>;
}

export interface AccountsState {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  fetchAccounts: (params?: {
    category_ids?: number[];
    subcategory_ids?: number[];
    status?: string[];
    seller_id?: number[];
    limit?: number;
    offset?: number;
  }) => Promise<{ items: Account[]; total_rows: number }>;
}

export interface SellersState {
  sellers: Seller[];
  loading: boolean;
  error: string | null;
  fetchSellers: (visibleInBot?: boolean) => Promise<void>;
}
