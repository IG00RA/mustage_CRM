import { BaseRequest } from './globalTypes';

export interface UserFunction {
  function_id: number;
  function_name: string;
  operations: ('READ' | 'CREATE' | 'UPDATE' | 'DELETE')[];
  subcategories: number[] | null;
}

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
  functions: UserFunction[];
  notifications_for_subcategories: number[] | null;
}

export interface CreateUserRequest {
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

export interface UpdateUserRequest {
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

export interface CreateUserResponse {
  login: string;
  is_admin: boolean;
  id?: number;
}

export interface UsersState {
  users: User[];
  totalRows: number;
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  fetchUsers: (
    params: BaseRequest
  ) => Promise<{ items: User[]; total_rows: number }>;
  createUser: (userData: CreateUserRequest) => Promise<CreateUserResponse>;
  editUser: (userData: UpdateUserRequest) => Promise<void>;
  fetchCurrentUser: () => Promise<User>;
  resetCurrentUser: () => void;
}
