import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Product } from '../types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, size?: string, color?: string) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size, color) => {
        const items = get().items;
        const existingItem = items.find(
          (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === color
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.cartId === existingItem.cartId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({
            items: [
              ...items,
              {
                ...product,
                cartId: `${product.id}-${size}-${color}-${Date.now()}`,
                selectedSize: size,
                selectedColor: color,
                quantity: 1,
              },
            ],
          });
        }
      },
      removeItem: (cartId) => {
        set({ items: get().items.filter((item) => item.cartId !== cartId) });
      },
      updateQuantity: (cartId, quantity) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.cartId === cartId ? { ...item, quantity } : item
          ),
        });
      },
      clearCart: () => set({ items: [] }),
      total: () => {
        return get().items.reduce((acc, item) => {
          const price = item.salePrice || item.price;
          return acc + price * item.quantity;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
