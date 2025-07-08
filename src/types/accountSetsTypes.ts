import { Seller } from './sellersTypes';
import { Account } from './accountsTypes';

export interface SetSubcategory {
  subcategory_id: number;
  accounts_quantity: number;
}

export interface AccountSet {
  set_id: number;
  name: string;
  set_category_id: number;
  price: number;
  cost_price: number;
  description: string;
  items_available: number;
  set_content: SetSubcategory[];
}

export interface CreateSetRequest {
  set_name: string;
  set_category_id: number;
  set_price: number;
  set_cost_price: number;
  set_description: string;
  set_subcategories: {
    subcategory_id: number;
    quantity: number;
  }[];
}

export interface CreateSetResponse {
  set_id: number;
  set_name: string;
  set_category_id: number;
  set_price: number;
  set_cost_price: number;
  set_description: string;
  set_subcategories: {
    subcategory_id: number;
    quantity: number;
  }[];
  status: string;
  message: string;
}

export interface FetchSetsParams {
  limit?: number;
  offset?: number;
  like_query?: string;
}

export interface FetchSetsResponse {
  total_rows: number;
  returned: number;
  offset: number;
  limit: number;
  items: AccountSet[];
}

export interface GetSetResponse {
  set_id: number;
  name: string;
  set_category_id: number;
  price: number;
  cost_price: number;
  description: string;
  items_available: number;
  set_content: SetSubcategory[];
}

export interface CreateSetItemRequest {
  quantity: number;
  platform: string;
}

export interface CreateSetItemResponse {
  quantity: number;
  set_id: number;
  set_name: string;
  platform: string;
  set_price: number;
  set_cost_price: number;
  set_description: string;
  set_subcategories: {
    subcategory_id: number;
    quantity: number;
  }[];
  set_items_ids: number[];
  status: string;
  message: string;
  shortage_info?: [
    {
      subcategory_id: number;
      needed_accounts: number;
      missing: number;
    }
  ];
}

export interface SellSetItemRequest {
  set_id: number;
  seller_id: number;
  item_quantity: number;
  client_name: string;
  client_dolphin_email?: string;
}

export interface SellSetItemResponse {
  success: boolean;
  set_id: number;
  seller_id: number;
  sold_quantity: number;
  set_price: number;
  total_price: number;
  client_name: string;
  client_dolphin_email?: string;
  account_data: {
    transfer_requested: boolean;
    transfer_success: boolean;
    transfer_message: string;
    account: Account;
  }[];
}

export interface FetchSetItemsParams {
  set_category_id?: number;
  set_id?: number;
  is_sold?: boolean;
  seller_id?: number;
  sold_start_date?: string;
  sold_end_date?: string;
  creation_start_date?: string;
  creation_end_date?: string;
  sort_by_creation?: 'ASC' | 'DESC';
  platform?: string;
  limit?: number;
  offset?: number;
}

export interface SetItem {
  set_item_id: number;
  set_item_name: string;
  set_id: number;
  creation_date: string;
  sold_datetime?: string;
  platform: string;
  client_name: string;
  client_transfer_email?: string;
  seller: Seller;
  account_ids: number[];
}

export interface FetchSetItemsResponse {
  total_rows: number;
  returned: number;
  offset: number;
  limit: number;
  items: SetItem[];
}

export interface UpdateSetRequest {
  set_id: number;
  set_name?: string;
  set_category_id?: number;
  set_price?: number;
  set_cost_price?: number;
  set_description?: string;
  set_subcategories?: {
    subcategory_id: number;
    quantity: number;
  }[];
}

export interface UpdateSetResponse {
  set_id: number;
  set_name: string;
  set_category_id: number;
  set_price: number;
  set_cost_price: number;
  set_description: string;
  set_subcategories: {
    subcategory_id: number;
    quantity: number;
  }[];
  status: string;
  message: string;
}

export interface DeleteSetItemRequest {
  set_id: number;
  quantity: number;
}

export interface DeleteSetItemResponse {
  status: string;
  message: string;
}

export interface AccountSetsState {
  sets: AccountSet[];
  loading: boolean;
  error: string | null;
  updateSet: (data: UpdateSetRequest) => Promise<UpdateSetResponse>;
  fetchSets: (params?: FetchSetsParams) => Promise<FetchSetsResponse>;
  createSet: (data: CreateSetRequest) => Promise<CreateSetResponse>;
  getSet: (setId: number) => Promise<GetSetResponse>;
  createSetItem: (
    setId: number,
    data: CreateSetItemRequest
  ) => Promise<CreateSetItemResponse>;
  sellSetItem: (data: SellSetItemRequest) => Promise<SellSetItemResponse>;
  fetchSetItems: (
    params: FetchSetItemsParams
  ) => Promise<FetchSetItemsResponse>;
  deleteSetItem: (data: DeleteSetItemRequest) => Promise<DeleteSetItemResponse>;
}
