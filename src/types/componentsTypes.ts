import { RangeType } from './salesTypes';

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface DateRangeSelectorProps {
  dateRange: RangeType;
  customPeriodLabel?: string;
  onDateRangeChange: (range: RangeType) => void;
  onCustomDatesChange: (start: string, end: string) => void;
  initialStartDate?: string;
  initialEndDate?: string;
  label?: string;
}

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
