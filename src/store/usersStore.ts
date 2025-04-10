import { create } from 'zustand';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';
import { ENDPOINTS } from '@/constants/api';

export interface User {
  user_id: number;
  login: string;
  first_name: string;
  last_name: string;
  is_admin?: boolean;
  is_referral?: boolean;
  email?: string;
  telegram_id: number;
  telegram_username: string;
  role?: {
    role_id: number;
    name: string;
    description: string;
  };
  functions: {
    function_id: number;
    function_name: string;
    operations: ('READ' | 'CREATE' | 'UPDATE' | 'DELETE')[];
    subcategories: number[] | null;
  }[];
  notifications_for_subcategories: number[] | null;
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
  role_id: number;
  functions?: {
    function_id: number;
    operations: string[];
    subcategories: number[];
  }[];
  notifications_for_subcategories: number[];
}

interface UpdateUserRequest {
  user_id: number;
  login?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  is_admin?: boolean;
  is_referral?: boolean;
  telegram_id?: number;
  telegram_username?: string;
  functions?: {
    function_id: number;
    operations: string[];
    subcategories: number[];
  }[];
  notifications_for_subcategories?: number[];
}

interface UserFullResponse extends User {}
interface CreateUserResponse {
  login: string;
  is_admin: boolean;
  id?: number;
}

interface UsersState {
  users: User[];
  totalRows: number;
  currentUser: UserFullResponse | null;
  loading: boolean;
  error: string | null;
  fetchUsers: (params: { limit?: number; offset?: number }) => Promise<{
    items: User[];
    total_rows: number;
  }>;
  createUser: (userData: CreateUserRequest) => Promise<CreateUserResponse>;
  editUser: (userData: UpdateUserRequest) => Promise<void>;
  fetchCurrentUser: () => Promise<UserFullResponse>;
  resetCurrentUser: () => void;
}

export const useUsersStore = create<UsersState>(set => ({
  users: [],
  totalRows: 0,
  currentUser: null,
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
          headers: getAuthHeaders(),
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
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  fetchCurrentUser: async () => {
    set({ loading: true, error: null });
    try {
      const data = await fetchWithErrorHandling<UserFullResponse>(
        `${ENDPOINTS.USERS_ME}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
        },
        set
      );

      set({
        currentUser: data,
        loading: false,
      });

      return data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
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

      set({ loading: false });
      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  editUser: async (userData: UpdateUserRequest) => {
    set({ loading: true, error: null });
    try {
      await fetchWithErrorHandling<void>(
        `${ENDPOINTS.USERS}/${userData.user_id}`,
        {
          method: 'PATCH',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ ...userData, user_id: undefined }),
        },
        set
      );

      set(state => {
        const updatedUsers = state.users.map(user => {
          if (user.user_id === userData.user_id) {
            return {
              ...user,
              ...(userData.login !== undefined && { login: userData.login }),
              ...(userData.first_name !== undefined && {
                first_name: userData.first_name,
              }),
              ...(userData.last_name !== undefined && {
                last_name: userData.last_name,
              }),
              ...(userData.email !== undefined && { email: userData.email }),
              ...(userData.is_admin !== undefined && {
                is_admin: userData.is_admin,
              }),
              ...(userData.is_referral !== undefined && {
                is_referral: userData.is_referral,
              }),
              ...(userData.telegram_id !== undefined && {
                telegram_id: userData.telegram_id,
              }),
              ...(userData.telegram_username !== undefined && {
                telegram_username: userData.telegram_username,
              }),
              ...(userData.functions !== undefined && {
                functions: userData.functions.map(func => ({
                  function_id: func.function_id,
                  function_name:
                    user.functions.find(f => f.function_id === func.function_id)
                      ?.function_name || '',
                  operations: func.operations as (
                    | 'READ'
                    | 'CREATE'
                    | 'UPDATE'
                    | 'DELETE'
                  )[],
                  subcategories: func.subcategories || null,
                })),
              }),
              ...(userData.notifications_for_subcategories !== undefined && {
                notifications_for_subcategories:
                  userData.notifications_for_subcategories,
              }),
            };
          }
          return user;
        });

        const updatedCurrentUser =
          state.currentUser && state.currentUser.user_id === userData.user_id
            ? {
                ...state.currentUser,
                ...(userData.login !== undefined && { login: userData.login }),
                ...(userData.first_name !== undefined && {
                  first_name: userData.first_name,
                }),
                ...(userData.last_name !== undefined && {
                  last_name: userData.last_name,
                }),
                ...(userData.email !== undefined && { email: userData.email }),
                ...(userData.is_admin !== undefined && {
                  is_admin: userData.is_admin,
                }),
                ...(userData.is_referral !== undefined && {
                  is_referral: userData.is_referral,
                }),
                ...(userData.telegram_id !== undefined && {
                  telegram_id: userData.telegram_id,
                }),
                ...(userData.telegram_username !== undefined && {
                  telegram_username: userData.telegram_username,
                }),
                ...(userData.functions !== undefined && {
                  functions: userData.functions.map(func => ({
                    function_id: func.function_id,
                    function_name:
                      state.currentUser!.functions.find(
                        f => f.function_id === func.function_id
                      )?.function_name || '',
                    operations: func.operations as (
                      | 'READ'
                      | 'CREATE'
                      | 'UPDATE'
                      | 'DELETE'
                    )[],
                    subcategories: func.subcategories || null,
                  })),
                }),
                ...(userData.notifications_for_subcategories !== undefined && {
                  notifications_for_subcategories:
                    userData.notifications_for_subcategories,
                }),
              }
            : state.currentUser;

        return {
          loading: false,
          users: updatedUsers,
          currentUser: updatedCurrentUser,
        };
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },
  resetCurrentUser: () => {
    set({ currentUser: null });
  },
}));
