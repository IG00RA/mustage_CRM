import { create } from 'zustand';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';
import { ENDPOINTS } from '@/constants/api';
import { PromoCode, PromoCodesState } from '@/types/componentsTypes';

export const usePromoCodesStore = create<PromoCodesState>(set => ({
  promoCodes: [],
  loading: false,
  error: null,
  totalRows: 0,

  fetchPromoCodes: async (params = {}) => {
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

    if (params.promocode_status) {
      queryParams.append('status', params.promocode_status);
    }

    if (params.search_query) {
      queryParams.append('search_query', params.search_query);
    }

    if (params.limit) {
      queryParams.append('limit', String(params.limit));
    }
    if (params.offset) {
      queryParams.append('offset', String(params.offset));
    }

    const url = `${ENDPOINTS.PROMO_CODES}?${queryParams.toString()}`;
    const data = await fetchWithErrorHandling<{
      items: PromoCode[];
      total_rows: number;
    }>(
      url,
      { method: 'GET', headers: getAuthHeaders(), credentials: 'include' },
      () => {}
    );
    set({ promoCodes: data.items, totalRows: data.total_rows });
    return { items: data.items, total_rows: data.total_rows };
  },
}));
