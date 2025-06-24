import { create } from 'zustand';
import { fetchWithErrorHandling, getAuthHeaders } from '../utils/apiUtils';
import { ENDPOINTS } from '@/constants/api';
import {
  ReferralPaymentSettings,
  ReferralsState,
} from '@/types/referralsTypes';

export const useReferralsStore = create<ReferralsState>(set => ({
  loading: false,
  error: null,

  savePaymentSettings: async (settings: ReferralPaymentSettings) => {
    set({ loading: true, error: null });
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
  },
}));
