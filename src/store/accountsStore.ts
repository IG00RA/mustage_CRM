import { create } from 'zustand';
import { Account, AccountsState, Response } from '../types/salesTypes';
import { ENDPOINTS } from '../constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';

interface ServerResponse {
  found_accounts: Account[];
  not_found_accounts: {
    account_ids: number[];
    account_names: string[];
  };
}

export const useAccountsStore = create<AccountsState>(set => ({
  accounts: [],
  loading: false,
  error: null,

  fetchAccounts: async (params = {}, updateState = true) => {
    const requestBody: Record<string, any> = {};

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

    if (params.limit) {
      requestBody.limit = params.limit;
    }
    if (params.offset) {
      requestBody.offset = params.offset;
    }

    if (typeof params.with_destination === 'boolean') {
      requestBody.with_destination = params.with_destination;
    }

    if (params.sold_start_date) {
      requestBody.sold_start_date = params.sold_start_date;
    }
    if (params.sold_end_date) {
      requestBody.sold_end_date = params.sold_end_date;
    }

    if (params.upload_start_date) {
      requestBody.upload_start_date = params.upload_start_date;
    }
    if (params.upload_end_date) {
      requestBody.upload_end_date = params.upload_end_date;
    }

    const url = ENDPOINTS.ACCOUNTS;
    const data = await fetchWithErrorHandling<Response<Account>>(
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

    return { items: data.items, total_rows: data.total_rows };
  },
  searchAccounts: async (searchParams: {
    like_query?: string;
    subcategory_id?: number;
  }) => {
    const requestBody: Record<string, any> = {
      account_ids: [],
      account_names: [],
      like_query: searchParams.like_query || '',
    };

    if (searchParams.subcategory_id) {
      requestBody.subcategory_id = searchParams.subcategory_id;
    }

    const url = `${ENDPOINTS.ACCOUNTS}/search`;
    const data = await fetchWithErrorHandling<ServerResponse>(
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

    set({ accounts: data.found_accounts });
    return {
      items: data.found_accounts,
      total_rows: data.found_accounts.length,
    };
  },
}));
