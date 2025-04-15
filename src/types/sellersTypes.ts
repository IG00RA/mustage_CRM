export interface Seller {
  seller_id: number;
  seller_name?: string | null;
  visible_in_bot: boolean | null;
}

export interface SellersState {
  sellers: Seller[];
  loading: boolean;
  error: string | null;
  fetchSellers: (visibleInBot?: boolean) => Promise<void>;
}
