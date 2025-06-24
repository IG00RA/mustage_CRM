import { create } from 'zustand';
import {
  AccountSetsState,
  CreateSetRequest,
  CreateSetResponse,
  FetchSetsResponse,
  GetSetResponse,
  CreateSetItemRequest,
  CreateSetItemResponse,
  SellSetItemRequest,
  SellSetItemResponse,
  FetchSetItemsParams,
  FetchSetItemsResponse,
  UpdateSetResponse,
  UpdateSetRequest,
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
      set
    );

    set({ sets: data.items, loading: false });
    return data;
  },

  createSet: async (data: CreateSetRequest) => {
    set({ loading: true, error: null });

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
      set
    );

    set({ loading: false });
    return response;
  },

  getSet: async (setId: number) => {
    set({ loading: true, error: null });

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
      set
    );

    set({ loading: false });
    return data;
  },

  createSetItem: async (setId: number, data: CreateSetItemRequest) => {
    set({ loading: true, error: null });

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
      set
    );
    return response;
  },

  sellSetItem: async (data: SellSetItemRequest) => {
    set({ loading: true, error: null });

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
      set
    );

    set({ loading: false });
    return response;
  },

  fetchSetItems: async (params: FetchSetItemsParams) => {
    set({ loading: true, error: null });

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
      set
    );

    set({ loading: false });
    return data;
  },

  updateSet: async (data: UpdateSetRequest) => {
    set({ loading: true, error: null });

    const url = `${ENDPOINTS.ACCOUNT_SETS}/${data.set_id}`;
    const response = await fetchWithErrorHandling<UpdateSetResponse>(
      url,
      {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      },
      set
    );

    set(state => ({
      loading: false,
      sets: state.sets.map(set =>
        set.set_id === response.set_id
          ? {
              set_id: response.set_id,
              name: response.set_name,
              set_category_id: response.set_category_id,
              price: response.set_price,
              cost_price: response.set_cost_price,
              description: response.set_description,
              items_available: set.items_available,
              set_content: response.set_subcategories.map(sub => ({
                subcategory_id: sub.subcategory_id,
                accounts_quantity: sub.quantity,
              })),
            }
          : set
      ),
    }));
    return response;
  },
}));
