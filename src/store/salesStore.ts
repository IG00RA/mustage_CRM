import { create } from 'zustand';
import { salesData } from '@/api/sales/data';

type SalesState = {
  sales: { period: string; amount: number; quantity: number }[];
};

export const useSalesStore = create<SalesState>(() => ({
  sales: salesData,
}));
