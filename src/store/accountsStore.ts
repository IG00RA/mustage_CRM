import { create } from 'zustand';
import {
  AccountsState,
  FetchAccountsParams,
  SearchResponse,
  ReplaceResponse,
  StopSellingResponse,
  SellAccountsRequest,
  SellAccountsResponse,
  Account,
  ReplaceRequest,
  AccountHistoryResponse,
} from '../types/accountsTypes';
import { ENDPOINTS } from '../constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';

export const useAccountsStore = create<AccountsState>(set => ({
  accounts: [],
  loading: false,
  error: null,

  fetchAccounts: async (params = {}, updateState = true) => {
    const requestBody: FetchAccountsParams = {};

    if (params.subcategory_ids?.length) {
      requestBody.subcategory_id =
        params.subcategory_ids.length === 1
          ? params.subcategory_ids[0]
          : params.subcategory_ids;
    } else if (params.category_ids?.length) {
      requestBody.category_id =
        params.category_ids.length === 1
          ? params.category_ids[0]
          : params.category_ids;
    }

    if (params.status?.length) {
      requestBody.status =
        params.status.length === 1 ? params.status[0] : params.status;
    }

    if (params.seller_id?.length) {
      requestBody.seller_id =
        params.seller_id.length === 1 ? params.seller_id[0] : params.seller_id;
    }

    if (params.limit) requestBody.limit = params.limit;
    if (params.offset) requestBody.offset = params.offset;
    if (typeof params.with_destination === 'boolean') {
      requestBody.with_destination = params.with_destination;
    }
    if (params.sold_start_date)
      requestBody.sold_start_date = params.sold_start_date;
    if (params.sold_end_date) requestBody.sold_end_date = params.sold_end_date;
    if (params.upload_start_date)
      requestBody.upload_start_date = params.upload_start_date;
    if (params.upload_end_date)
      requestBody.upload_end_date = params.upload_end_date;
    if (params.like_query) requestBody.like_query = params.like_query;
    if (params.sort_by_upload)
      requestBody.sort_by_upload = params.sort_by_upload;
    if (typeof params.in_set === 'boolean') {
      requestBody.in_set = params.in_set;
    }

    if (params.platform === 'CRM') {
      requestBody.platform = params.platform;
    }

    if (params.set_item_id === null) {
      requestBody.set_item_id = params.set_item_id;
    }

    const url = ENDPOINTS.ACCOUNTS;
    const data = await fetchWithErrorHandling<{
      items: Account[];
      total_rows: number;
    }>(
      url,
      {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      },
     set
    );

    if (updateState) {
      set({ accounts: data.items });
    }
    set({ loading: false });
    return { items: data.items, total_rows: data.total_rows };
  },

  searchAccounts: async (accountNames: string[]) => {
    set({ loading: true, error: null });

    const requestBody = {
      account_names: accountNames,
    };

    const url = ENDPOINTS.ACCOUNTS_SEARCH || '/accounts/search';
    const data = await fetchWithErrorHandling<SearchResponse>(
      url,
      {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      },
     set
    );

    set({ loading: false });
    return data;
  },

  replaceAccounts: async (data: ReplaceRequest) => {
    set({ loading: true, error: null });

    const url = ENDPOINTS.ACCOUNTS_REPLACE || '/accounts/replace';
    const response = await fetchWithErrorHandling<ReplaceResponse>(
      url,
      {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      },
     set
    );

    set({ loading: false });
    return response;
  },

  stopSellingAccounts: async (accountIds: number[]) => {
    set({ loading: true, error: null });

    const requestBody = {
      account_ids: accountIds,
    };

    const url = ENDPOINTS.ACCOUNTS_STOP_SELLING || '/accounts/stop-selling';
    const response = await fetchWithErrorHandling<StopSellingResponse>(
      url,
      {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      },
     set
    );

    set({ loading: false });
    return response;
  },

  sellAccounts: async (request: SellAccountsRequest) => {
    set({ loading: true, error: null });

    const url = ENDPOINTS.ACCOUNTS_SELL || '/accounts/sell';
    const data = await fetchWithErrorHandling<SellAccountsResponse>(
      url,
      {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(request),
      },
     set
    );

    set({ loading: false });
    return data;
  },

  fetchAccountHistory: async (accountId: number) => {
    set({ loading: true, error: null });

    const url = `${ENDPOINTS.ACCOUNTS}/history/${accountId}`;
    const data = await fetchWithErrorHandling<AccountHistoryResponse>(
      url,
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

    set({ loading: false });
    return data;
  },
}));
