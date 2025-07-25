import { create } from 'zustand';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';
import { ENDPOINTS } from '@/constants/api';
import {
  CreateRoleRequest,
  Role,
  RolesState,
  UpdateRoleRequest,
} from '@/types/rolesTypes';

export const useRolesStore = create<RolesState>(set => ({
  roles: [],
  totalRows: 0,
  currentRole: null,
  loading: false,
  error: null,

  fetchRoles: async ({ limit = 5, offset = 0, like_query }) => {
    set({ loading: true, error: null });

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
  },

  fetchRoleById: async (roleId: number) => {
    set({ loading: true, error: null });

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
  },

  createRole: async (roleData: CreateRoleRequest) => {
    set({ loading: true, error: null });

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
  },

  editRole: async (roleData: UpdateRoleRequest) => {
    set({ loading: true, error: null });

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
  },

  resetCurrentRole: () => {
    set({ currentRole: null });
  },
}));
