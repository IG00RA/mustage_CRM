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

    if (typeof params.with_destination === 'boolean') {
      queryParams.append('with_destination', String(params.with_destination));
    }

    // Додаємо параметри для дати продажу
    if (params.sold_start_date) {
      queryParams.append('sold_start_date', params.sold_start_date);
    }
    if (params.sold_end_date) {
      queryParams.append('sold_end_date', params.sold_end_date);
    }

    // Додаємо параметри для дати завантаження
    if (params.upload_start_date) {
      queryParams.append('upload_start_date', params.upload_start_date);
    }
    if (params.upload_end_date) {
      queryParams.append('upload_end_date', params.upload_end_date);
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
