import { create } from 'zustand';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';
import { ENDPOINTS } from '@/constants/api';

export interface RoleFunction {
  function_id: number;
  function_name?: string;
  operations: ('READ' | 'CREATE' | 'UPDATE' | 'DELETE')[];
  subcategories: number[] | null;
}

export interface Role {
  role_id: number;
  name: string;
  description: string | null;
  functions: RoleFunction[];
}

interface CreateRoleRequest {
  name: string;
  description: string;
  functions: {
    function_id: number;
    operations: string[];
    subcategories: number[];
  }[];
}

interface UpdateRoleRequest {
  role_id: number;
  name?: string;
  description?: string;
  functions?: {
    function_id: number;
    operations: string[];
    subcategories: number[];
  }[];
}

interface RolesState {
  roles: Role[];
  totalRows: number;
  currentRole: Role | null;
  loading: boolean;
  error: string | null;
  fetchRoles: (params: {
    limit?: number;
    offset?: number;
    like_query?: string;
  }) => Promise<{ items: Role[]; total_rows: number }>;
  fetchRoleById: (roleId: number) => Promise<Role>;
  createRole: (roleData: CreateRoleRequest) => Promise<Role>;
  editRole: (roleData: UpdateRoleRequest) => Promise<void>;
  resetCurrentRole: () => void;
}

export const useRolesStore = create<RolesState>(set => ({
  roles: [],
  totalRows: 0,
  currentRole: null,
  loading: false,
  error: null,

  fetchRoles: async ({ limit = 5, offset = 0, like_query }) => {
    set({ loading: true, error: null });
    try {
      const url = new URL(ENDPOINTS.ROLES);
      url.searchParams.append('limit', limit.toString());
      url.searchParams.append('offset', offset.toString());
      if (like_query) url.searchParams.append('like_query', like_query);

      const data = await fetchWithErrorHandling<{
        total_rows: number;
        returned: number;
        offset: number;
        limit: number;
        items: Role[];
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
        roles: data.items,
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

  fetchRoleById: async (roleId: number) => {
    set({ loading: true, error: null });
    try {
      const data = await fetchWithErrorHandling<Role>(
        `${ENDPOINTS.ROLES}/${roleId}`,
        {
          method: 'GET',
          headers: getAuthHeaders(),
          credentials: 'include',
        },
        set
      );

      set({
        currentRole: data,
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

  createRole: async (roleData: CreateRoleRequest) => {
    set({ loading: true, error: null });
    try {
      const response = await fetchWithErrorHandling<Role>(
        ENDPOINTS.ROLES,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(roleData),
        },
        set
      );

      set(state => ({
        roles: [...state.roles, response],
        totalRows: state.totalRows + 1,
        loading: false,
      }));

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  editRole: async (roleData: UpdateRoleRequest) => {
    set({ loading: true, error: null });
    try {
      await fetchWithErrorHandling<void>(
        `${ENDPOINTS.ROLES}/${roleData.role_id}`,
        {
          method: 'PATCH',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ ...roleData, role_id: undefined }),
        },
        set
      );

      set(state => {
        const updatedRoles = state.roles.map(role => {
          if (role.role_id === roleData.role_id) {
            return {
              ...role,
              ...(roleData.name !== undefined && { name: roleData.name }),
              ...(roleData.description !== undefined && {
                description: roleData.description,
              }),
              ...(roleData.functions !== undefined && {
                functions: roleData.functions.map(func => ({
                  function_id: func.function_id,
                  function_name:
                    role.functions.find(f => f.function_id === func.function_id)
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
            };
          }
          return role;
        });

        const updatedCurrentRole =
          state.currentRole && state.currentRole.role_id === roleData.role_id
            ? {
                ...state.currentRole,
                ...(roleData.name !== undefined && { name: roleData.name }),
                ...(roleData.description !== undefined && {
                  description: roleData.description,
                }),
                ...(roleData.functions !== undefined && {
                  functions: roleData.functions.map(func => ({
                    function_id: func.function_id,
                    function_name:
                      state.currentRole!.functions.find(
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
              }
            : state.currentRole;

        return {
          loading: false,
          roles: updatedRoles,
          currentRole: updatedCurrentRole,
        };
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  resetCurrentRole: () => {
    set({ currentRole: null });
  },
}));
