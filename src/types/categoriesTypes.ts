export interface Category {
  account_category_id: number;
  account_category_name: string;
  description: string | null;
  is_set_category: boolean;
}

export interface Subcategory {
  account_subcategory_id: number;
  account_subcategory_name: string;
  account_category_id: number;
  available_accounts: number;
  available_crm_accounts: number;
  available_shop_accounts: number;
  is_accounts_set: boolean;
  price: number;
  cost_price: number;
  description?: string | null;
  output_format_field?: string[] | null;
  output_separator?: string | null;
  category?: Category;
}

export interface CategoriesState {
  categories: Category[];
  subcategories: Subcategory[];

  categoriesWithParams: Category[];
  subcategoriesWithParams: Subcategory[];

  loading: boolean;
  error: string | null;

  fetchCategories: (params?: { is_set_category?: boolean }) => Promise<void>;
  fetchSubcategories: (
    categoryId?: number,
    is_accounts_set?: boolean,
    limit?: number
  ) => Promise<void>;
}
