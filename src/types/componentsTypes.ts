//Pagination
export interface PaginationState {
  pageIndex: number;
  pageSize: number;
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
