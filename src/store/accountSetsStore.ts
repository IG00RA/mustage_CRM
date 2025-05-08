import { create } from 'zustand';
import {
  AccountSet,
  AccountSetsState,
  CreateSetRequest,
  CreateSetResponse,
  FetchSetsParams,
  FetchSetsResponse,
  GetSetResponse,
  CreateSetItemRequest,
  CreateSetItemResponse,
  SellSetItemRequest,
  SellSetItemResponse,
  FetchSetItemsParams,
  FetchSetItemsResponse,
} from '../types/accountSetsTypes';
import { ENDPOINTS } from '../constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';

export const useAccountSetsStore = create<AccountSetsState>(set => ({
  sets: [],
  loading: false,
  error: null,

  fetchSets: async (params = {}) => {
    set({ loading: true, error: null });

    const queryParams = new URLSearchParams();
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const url = `${ENDPOINTS.ACCOUNT_SETS}?${queryParams.toString()}`;

    try {
      const data = await fetchWithErrorHandling<FetchSetsResponse>(
        url,
        {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
        () => {}
      );

      set({ sets: data.items, loading: false });
      return data;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  createSet: async (data: CreateSetRequest) => {
    set({ loading: true, error: null });

    try {
      const url = ENDPOINTS.ACCOUNT_SETS;
      const response = await fetchWithErrorHandling<CreateSetResponse>(
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
        () => {}
      );

      set({ loading: false });
      return response;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  getSet: async (setId: number) => {
    set({ loading: true, error: null });

    try {
      const url = `${ENDPOINTS.ACCOUNT_SETS}/${setId}`;
      const data = await fetchWithErrorHandling<GetSetResponse>(
        url,
        {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        },
        () => {}
      );

      set({ loading: false });
      return data;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  createSetItem: async (setId: number, data: CreateSetItemRequest) => {
    set({ loading: true, error: null });

    try {
      const url = `${ENDPOINTS.ACCOUNT_SETS}/${setId}`;
      const response = await fetchWithErrorHandling<CreateSetItemResponse>(
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
        () => {}
      );

      set({ loading: false });
      return response;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  sellSetItem: async (data: SellSetItemRequest) => {
    set({ loading: true, error: null });

    try {
      const url = `${ENDPOINTS.ACCOUNT_SETS}/sell`;
      const response = await fetchWithErrorHandling<SellSetItemResponse>(
        url,
        {
          method: 'PATCH',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(data),
        },
        () => {}
      );

      set({ loading: false });
      return response;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },

  fetchSetItems: async (params: FetchSetItemsParams) => {
    set({ loading: true, error: null });

    try {
      const url = `${ENDPOINTS.ACCOUNT_SETS}/items`;
      const data = await fetchWithErrorHandling<FetchSetItemsResponse>(
        url,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(params),
        },
        () => {}
      );

      set({ loading: false });
      return data;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
}));
