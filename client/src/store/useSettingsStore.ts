import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

interface SettingsState {
  currency: string;
  currencySymbol: string;
  language: string;
  storeName: string;
  taxRate: number;
  shippingFee: number;
  freeShippingThreshold: number;
  isLoaded: boolean;
  fetchSettings: () => Promise<void>;
  formatPrice: (price: number) => string;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      currency: 'USD',
      currencySymbol: '$',
      language: 'en',
      storeName: 'Fashion Store',
      taxRate: 0,
      shippingFee: 0,
      freeShippingThreshold: 100,
      isLoaded: false,

      fetchSettings: async () => {
        try {
          const res = await api.get('/settings');
          set({
            currency: res.data.currency || 'USD',
            currencySymbol: res.data.currencySymbol || '$',
            language: res.data.language || 'en',
            storeName: res.data.storeName || 'Fashion Store',
            taxRate: parseFloat(res.data.taxRate) || 0,
            shippingFee: parseFloat(res.data.shippingFee) || 0,
            freeShippingThreshold: parseFloat(res.data.freeShippingThreshold) || 100,
            isLoaded: true,
          });
        } catch (error) {
          console.error('Failed to fetch settings:', error);
          set({ isLoaded: true });
        }
      },

      formatPrice: (price: number) => {
        const { currencySymbol, currency } = get();
        // For currencies that come after the number (like TND)
        const suffixCurrencies = ['TND', 'MAD'];
        if (suffixCurrencies.includes(currency)) {
          return `${price.toFixed(2)} ${currencySymbol}`;
        }
        return `${currencySymbol}${price.toFixed(2)}`;
      },
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        currency: state.currency,
        currencySymbol: state.currencySymbol,
        language: state.language,
        storeName: state.storeName,
      }),
    }
  )
);
