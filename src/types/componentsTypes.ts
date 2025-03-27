import { RangeType } from './salesTypes';

//Pagination
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

//Stat
export interface DateRangeSelectorProps {
  dateRange: RangeType;
  customPeriodLabel?: string;
  onDateRangeChange: (range: RangeType) => void;
  onCustomDatesChange: (start: string, end: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
  label?: string;
}

//Category
export interface UpdateCategoryProps {
  categoryId: number;
  initialName: string;
  initialDescription?: string;
  onClose: () => void;
}

export type UpdateCategoryFormData = {
  account_category_name: string;
  description: string;
};

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

export interface PromoCodesState {
  promoCodes: PromoCode[];
  loading: boolean;
  error: string | null;
  totalRows: number;
  fetchPromoCodes: (params?: {
    category_ids?: number[];
    subcategory_ids?: number[];
    promocode_status?: string;
    search_query?: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ items: PromoCode[]; total_rows: number }>;
}
