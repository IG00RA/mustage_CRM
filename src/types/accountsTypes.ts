import { Category, Subcategory } from './categoriesTypes';
import { BaseRequest, BaseResponse } from './globalTypes';
import { Seller } from './sellersTypes';

interface Browser {
  browser_id: number;
  browser_name: string;
}

interface DestinationResponse {
  destination_id: number;
  browser_id: number;
  username: string;
  browser?: Browser | null;
}

export interface Account {
  account_id: number;
  upload_datetime: string;
  sold_datetime?: string | null;
  worker_name: string;
  teamlead_name?: string | null;
  client_name?: string | null;
  account_name: string;
  in_set?: boolean;
  price?: number | null;
  status: 'SOLD' | 'NOT SOLD' | 'REPLACED' | 'EXCLUDED' | 'SELF USE';
  frozen_at?: string | null;
  replace_reason?: string | null;
  profile_link?: string | null;
  archive_link?: string | null;
  account_data?: string | null;
  set_item_id?: number | null;
  platform?: string;
  seller?: Seller | null;
  subcategory: Subcategory;
  category?: Category;
  destination?: DestinationResponse | null;
}

export interface HistoryEvent {
  event_id: number;
  event_message: string;
  event_datetime: string;
  account_id: number;
  user_id: number;
}

export interface AccountHistoryResponse {
  account: Account;
  history: HistoryEvent[];
}

export interface FetchAllAccountsParams extends BaseRequest {
  category_ids?: number[];
  subcategory_ids?: number[];
  status?: string[];
  seller_id?: number[];
  like_query?: string;
  sort_by_upload?: 'ASC' | 'DESC';
  with_destination?: boolean;
  in_set?: boolean;
  sold_start_date?: string;
  sold_end_date?: string;
  upload_start_date?: string;
  upload_end_date?: string;
  platform?: string;
  set_item_id?: null;
}

export interface FetchAccountsParams extends BaseRequest {
  category_id?: number | number[];
  subcategory_id?: number | number[];
  status?: string | string[];
  seller_id?: number | number[];
  like_query?: string;
  sort_by_upload?: 'ASC' | 'DESC';
  with_destination?: boolean;
  sold_start_date?: string;
  sold_end_date?: string;
  upload_start_date?: string;
  upload_end_date?: string;
  in_set?: boolean;
  platform?: string;
  set_item_id?: null;
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

export interface ReplaceResponse extends BaseResponse {
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

export interface StopSellingResponse extends BaseResponse {
  detail: string;
}

export interface SellAccountsRequest {
  subcategory_id: number;
  seller_id: number;
  quantity: number;
  price: number;
  client_name: string;
  client_dolphin_email?: string;
}

export interface SellAccountsResponse extends BaseResponse {
  subcategory_id: number;
  seller_id: number;
  quantity: number;
  price: number;
  client_name: string;
  client_dolphin_email?: string;
  account_data: AccountDataWrapper[];
}

export interface DownloadInternalRequest {
  subcategory_id: number;
  quantity: number;
  purpose: string;
}

export type DownloadInternalResponse = Account[];

export interface AccountDataWrapper {
  transfer_requested: boolean;
  transfer_success: boolean;
  transfer_message: string;
  account: Account;
}

export interface AccountsState {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  fetchAccounts: (
    params?: FetchAllAccountsParams,
    updateState?: boolean
  ) => Promise<{ items: Account[]; total_rows: number }>;
  searchAccounts: (accountNames: string[]) => Promise<SearchResponse>;
  replaceAccounts: (data: ReplaceRequest) => Promise<ReplaceResponse>;
  stopSellingAccounts: (accountIds: number[]) => Promise<StopSellingResponse>;
  sellAccounts: (request: SellAccountsRequest) => Promise<SellAccountsResponse>;
  fetchAccountHistory: (accountId: number) => Promise<AccountHistoryResponse>;
  downloadInternalAccounts: (
    request: DownloadInternalRequest
  ) => Promise<DownloadInternalResponse>;
}
