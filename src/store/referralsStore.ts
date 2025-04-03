import { create } from 'zustand';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';
import { ENDPOINTS } from '@/constants/api';

export interface PaymentModel {
  payment_model: 'RevShare' | 'CPA';
  payment_reason: 'BalanceTopUp';
  percentage?: number;
  fixed?: number;
  min_amount: number;
}

interface ReferralPaymentSettings {
  referrer_id: number;
  payment_models: PaymentModel[];
}

interface ReferralsState {
  loading: boolean;
  error: string | null;
  savePaymentSettings: (settings: ReferralPaymentSettings) => Promise<void>;
}

export const useReferralsStore = create<ReferralsState>(set => ({
  loading: false,
  error: null,

  savePaymentSettings: async (settings: ReferralPaymentSettings) => {
    set({ loading: true, error: null });
    try {
      await fetchWithErrorHandling<void>(
        ENDPOINTS.REFERRAL_PAYMENT_SETTINGS,
        {
          method: 'POST',
          headers: {
            ...getAuthHeaders(),
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(settings),
        },
        set
      );
      set({ loading: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      set({ loading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },
}));
