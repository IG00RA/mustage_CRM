export interface PaymentModel {
  payment_model: 'RevShare' | 'CPA';
  payment_reason: 'BalanceTopUp' | 'AccountsSold';
  percentage?: number;
  fixed?: number;
  min_amount?: number;
}

export interface ReferralPaymentSettings {
  referrer_id: number;
  payment_models: PaymentModel[];
}

export interface ReferralsState {
  loading: boolean;
  error: string | null;
  savePaymentSettings: (settings: ReferralPaymentSettings) => Promise<void>;
}
