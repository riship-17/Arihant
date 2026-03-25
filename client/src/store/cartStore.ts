import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name?: string;
  price: number;
  size: string;
  quantity: number;
  image?: string;
  schoolId?: string | null;
  isKitItem?: boolean;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  // Getters
  getTotalItems: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item) => set((state) => {
        const existingItem = state.items.find(
          (i) => i.productId === item.productId && i.size === item.size
        );
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.productId === item.productId && i.size === item.size
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          };
        }
        return { items: [...state.items, item] };
      }),

      removeFromCart: (productId, size) => set((state) => ({
        items: state.items.filter((i) => !(i.productId === productId && i.size === size)),
      })),

      updateQuantity: (productId, size, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.productId === productId && i.size === size
            ? { ...i, quantity: Math.max(1, quantity) }
            : i
        ),
      })),

      clearCart: () => set({ items: [] }),

      getTotalItems: () => get().items.reduce((total, item) => total + item.quantity, 0),
      
      getSubtotal: () => get().items.reduce((total, item) => total + item.price * item.quantity, 0),
    }),
    {
      name: 'arihant-cart-storage', // unique name
    }
  )
);
