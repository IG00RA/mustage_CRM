import { create } from 'zustand';
import {
  Category,
  Subcategory,
  Response,
  CategoriesState,
} from '../types/salesTypes';
import { ENDPOINTS } from '../constants/api';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';

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
      set
    );
    set({ categories: data.items });
  },

  fetchSubcategories: async (categoryId?: number) => {
    const url = categoryId
      ? `${ENDPOINTS.SUBCATEGORIES}?category_id=${categoryId}&limit=100`
      : `${ENDPOINTS.SUBCATEGORIES}?limit=100`;
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
    set({ subcategories: data.items });
  },
}));
