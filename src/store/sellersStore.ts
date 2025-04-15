import { create } from 'zustand';
import { Seller, SellersState } from '../types/salesTypes';
import { ENDPOINTS } from '../constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';

export const useSellersStore = create<SellersState>(set => ({
  sellers: [],
  loading: false,
  error: null,

  fetchSellers: async (visibleInBot?: boolean) => {
    const queryParams = new URLSearchParams();
    if (visibleInBot !== undefined)
      queryParams.append('visible_in_bot', String(visibleInBot));
    const url = `${ENDPOINTS.SELLERS}?${queryParams.toString()}`;
    const data = await fetchWithErrorHandling<Seller[]>(
      url,
      { method: 'GET', headers: getAuthHeaders(), credentials: 'include' },
      () => {}
    );
    set({ sellers: data });
  },
}));
