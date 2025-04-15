import { BaseRequest } from './globalTypes';

export interface PromoCode {
  promocode_id: number;
  name: string;
  discount: number;
  promocode: string;
  promocode_status: 'ACTIVE' | 'DEACTIVATED';
  created_at: string;
  expires_at?: string;
  subcategory_ids?: number[];
}

export interface FetchPromoCodesParams extends BaseRequest {
  category_ids?: number[];
  subcategory_ids?: number[];
  promocode_status?: 'ACTIVE' | 'DEACTIVATED';
  search_query?: string;
}

export interface PromoCodesState {
  promoCodes: PromoCode[];
  loading: boolean;
  error: string | null;
  totalRows: number;
  fetchPromoCodes: (
    params?: FetchPromoCodesParams
  ) => Promise<{ items: PromoCode[]; total_rows: number }>;
}

export interface FetchPromoCodesTypes {
  category_ids?: number[];
  subcategory_ids?: number[];
  promocode_status?: 'ACTIVE' | 'DEACTIVATED';
  search_query?: string;
  limit?: number;
  offset?: number;
}
