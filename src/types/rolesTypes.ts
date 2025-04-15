import { BaseRequest } from './globalTypes';

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

export interface CreateRoleRequest {
  name: string;
  description: string;
  functions: {
    function_id: number;
    operations: string[];
    subcategories: number[];
  }[];
}

export interface UpdateRoleRequest {
  role_id: number;
  name?: string;
  description?: string;
  functions?: {
    function_id: number;
    operations: string[];
    subcategories: number[];
  }[];
}

export interface FetchRolesParams extends BaseRequest {
  like_query?: string;
}

export interface RolesState {
  roles: Role[];
  totalRows: number;
  currentRole: Role | null;
  loading: boolean;
  error: string | null;
  fetchRoles: (
    params: FetchRolesParams
  ) => Promise<{ items: Role[]; total_rows: number }>;
  fetchRoleById: (roleId: number) => Promise<Role>;
  createRole: (roleData: CreateRoleRequest) => Promise<Role>;
  editRole: (roleData: UpdateRoleRequest) => Promise<void>;
  resetCurrentRole: () => void;
}
