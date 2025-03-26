import { create } from 'zustand';
import { Account, AccountsState, Response } from '../types/salesTypes';
import { ENDPOINTS } from '../constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';

export const useAccountsStore = create<AccountsState>(set => ({
  accounts: [],
  loading: false,
  error: null,

  fetchAccounts: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.subcategory_ids?.length) {
      params.subcategory_ids.forEach(id => {
        queryParams.append('subcategory_id', String(id));
      });
    } else if (params.category_ids?.length) {
      params.category_ids.forEach(id => {
        queryParams.append('category_id', String(id));
      });
    }

    if (params.status?.length) {
      queryParams.append('status', params.status.join(','));
    }

    if (params.seller_id?.length) {
      queryParams.append('seller_id', params.seller_id.join(','));
    }

    if (params.limit) {
      queryParams.append('limit', String(params.limit));
    }
    if (params.offset) {
      queryParams.append('offset', String(params.offset));
    }

    const url = `${ENDPOINTS.ACCOUNTS}?${queryParams.toString()}`;
    const data = await fetchWithErrorHandling<Response<Account>>(
      url,
      { method: 'GET', headers: getAuthHeaders(), credentials: 'include' },
      set
    );
    set({ accounts: data.items });
    return { items: data.items, total_rows: data.total_rows };
  },
}));
