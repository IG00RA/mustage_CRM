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
  loading: false,
  error: null,

  fetchCategories: async () => {
    const data = await fetchWithErrorHandling<Response<Category>>(
      `${ENDPOINTS.CATEGORIES}?limit=100`,
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
    set({ categories: data.items });
  },

  fetchSubcategories: async (
    categoryId?: number,
    is_accounts_set?: boolean
  ) => {
    let url = `${ENDPOINTS.SUBCATEGORIES}?limit=100`;
    if (categoryId) {
      url += `&category_id=${categoryId}`;
    }
    if (is_accounts_set !== undefined) {
      url += `&is_accounts_set=${is_accounts_set}`;
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
      () => {}
    );
    set({ subcategories: data.items });
  },
}));
