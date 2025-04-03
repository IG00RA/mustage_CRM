import { create } from 'zustand';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';
import { ENDPOINTS } from '@/constants/api';

interface User {
  user_id: number;
  login: string;
  first_name: string;
  last_name: string;
  is_admin?: boolean;
  is_referral?: boolean;
  email?: string;
  telegram_id: number;
  telegram_username: string;
  functions: {
    function_id: number;
    function_name: string;
    operations: ('READ' | 'CREATE' | 'UPDATE' | 'DELETE')[];
    subcategories: number[] | null;
  }[];
  notifications_for_subcategories: number[] | null;
}

interface UsersState {
  users: User[];
  totalRows: number;
  loading: boolean;
  error: null | string;
  fetchUsers: (params: { limit?: number; offset?: number }) => Promise<{
    items: User[];
    total_rows: number;
  }>;
  createUser: (userData: CreateUserRequest) => Promise<CreateUserResponse>;
}

interface CreateUserRequest {
  login: string;
  password: string;
  first_name: string;
  last_name: string;
  email?: string;
  is_admin: boolean;
  is_referral: boolean;
  telegram_id: number;
  telegram_username: string;
  functions: {
    function_id: number;
    operations: string[];
    subcategories: number[];
  }[];
  notifications_for_subcategories: number[];
}

interface CreateUserResponse {
  login: string;
  is_admin: boolean;
}

export const useUsersStore = create<UsersState>(set => ({
  users: [],
  totalRows: 0,
  loading: false,
  error: null,

  fetchUsers: async ({ limit = 5, offset = 0 }) => {
    set({ loading: true, error: null });

    try {
      const url = new URL(ENDPOINTS.USERS);
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('offset', offset.toString());

      const data = await fetchWithErrorHandling<{
        total_rows: number;
        returned: number;
        offset: number;
        limit: number;
        items: User[];
      }>(
        url.toString(),
        {
          method: 'GET',
          headers: {
            ...getAuthHeaders(),
          },
          credentials: 'include',
        },
        set
      );

      set({
        users: data.items,
        totalRows: data.total_rows,
        loading: false,
      });

      return { items: data.items, total_rows: data.total_rows };
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
  createUser: async (userData: CreateUserRequest) => {
    set({ loading: true, error: null });

    try {
      const response = await fetchWithErrorHandling<CreateUserResponse>(
        ENDPOINTS.REGISTER_USER,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(userData),
        },
        set
      );

      set(state => ({
        loading: false,
      }));

      return response;
    } catch (error) {
      set({
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  },
}));
