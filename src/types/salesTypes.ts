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
  description?: string | null;
  output_format_field?: string[] | null;
  output_separator?: string | null;
  category?: Category;
}

interface DestinationResponse {
  destination_id: number;
  browser_id: number;
  username: string;
  browser?: Browser | null;
}

interface Browser {
  browser_id: number;
  browser_name: string;
}

export interface Account {
  account_id: number;
  upload_datetime: string;
  sold_datetime?: string | null;
  worker_name: string;
  teamlead_name?: string | null;
  client_name?: string | null;
  account_name: string;
  price?: number | null;
  status: 'SOLD' | 'NOT SOLD' | 'REPLACED' | 'EXCLUDED';
  frozen_at?: string | null;
  replace_reason?: string | null;
  profile_link?: string | null;
  archive_link?: string | null;
  account_data?: string | null;
  seller?: Seller | null;
  subcategory: Subcategory;
  category: Category;
  destination?: DestinationResponse | null;
}

export interface Seller {
  seller_id: number;
  seller_name?: string | null;
  visible_in_bot: boolean | null;
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
  | 'custom'
  | 'all';

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

interface FetchAccountsParams {
  category_ids?: number[];
  subcategory_ids?: number[];
  status?: string[];
  seller_id?: number[];
  limit?: number;
  offset?: number;
  like_query?: string;
  sort_by_upload?: string;
  with_destination?: boolean;
  sold_start_date?: string;
  sold_end_date?: string;
  upload_start_date?: string;
  upload_end_date?: string;
}

export interface SearchResponse {
  found_accounts: Account[];
  not_found_accounts: Record<string, (number | string)[]>;
}

export interface ReplaceRequest {
  account_ids: number[];
  subcategory_id: number;
  seller_id: number;
  replace_reason: string;
  new_price: number;
  client_name: string;
  client_dolphin_email?: string;
}

export interface ReplaceResponse {
  success: boolean;
  subcategory_id: number;
  seller_id: number;
  quantity: number;
  price: number;
  client_name: string;
  client_dolphin_email?: string;
  account_data: {
    transfer_requested: boolean;
    transfer_success: boolean;
    transfer_message: string;
    account: Account;
  }[];
}

export interface StopSellingResponse {
  detail: string;
  message: string;
  success: boolean;
}

export interface AccountsState {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  fetchAccounts: (
    params?: FetchAccountsParams,
    updateState?: boolean
  ) => Promise<{ items: Account[]; total_rows: number }>;
  searchAccounts: (accountNames: string[]) => Promise<SearchResponse>;
  replaceAccounts: (data: ReplaceRequest) => Promise<ReplaceResponse>;
  stopSellingAccounts: (accountIds: number[]) => Promise<StopSellingResponse>;
}
export interface SellersState {
  sellers: Seller[];
  loading: boolean;
  error: string | null;
  fetchSellers: (visibleInBot?: boolean) => Promise<void>;
}
