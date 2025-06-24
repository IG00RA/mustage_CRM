import { create } from 'zustand';
import { ENDPOINTS } from '../constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';
import {
  CategoriesState,
  Category,
  Subcategory,
} from '@/types/categoriesTypes';
import { Response } from '@/types/globalTypes';

export const useCategoriesStore = create<CategoriesState>(set => ({
  categories: [],
  subcategories: [],

  categoriesWithParams: [],
  subcategoriesWithParams: [],

  loading: false,
  error: null,

  fetchCategories: async (params?: { is_set_category?: boolean }) => {
    set({ loading: true, error: null });

    let url = `${ENDPOINTS.CATEGORIES}?limit=100`;
    const hasParams = params?.is_set_category !== undefined;

    if (hasParams) {
      url += `&is_set_category=${params.is_set_category}`;
    }

    const data = await fetchWithErrorHandling<Response<Category>>(
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

    set(() => ({
      loading: false,
      ...(hasParams
        ? { categoriesWithParams: data.items }
        : { categories: data.items }),
    }));
  },

  fetchSubcategories: async (
    categoryId?: number,
    is_accounts_set?: boolean,
    limit?: number
  ) => {
    set({ loading: true, error: null });

    let url = `${ENDPOINTS.SUBCATEGORIES}?`;
    const hasParams =
      categoryId !== undefined ||
      is_accounts_set !== undefined ||
      limit !== undefined;

    if (categoryId) url += `category_id=${categoryId}&`;
    if (limit) url += `limit=${limit}&`;
    if (is_accounts_set !== undefined) {
      url += `is_accounts_set=${is_accounts_set}&`;
    }

    const data = await fetchWithErrorHandling<Response<Subcategory>>(
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

    set(() => ({
      loading: false,
      ...(hasParams
        ? { subcategoriesWithParams: data.items }
        : { subcategories: data.items }),
    }));
  },
}));
