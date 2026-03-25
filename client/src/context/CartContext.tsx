"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

/* ───────────────── types ───────────────── */
export interface CartItem {
  item_id: string;
  item_name: string;
  item_type: string;
  image_url: string;
  price: number;
  selected_size: string;
  quantity: number;
  subtotal: number;
  school_id?: string | null;
  is_kit_item?: boolean;
}

interface CartContextValue {
  items: CartItem[];
  addToCart: (entry: Omit<CartItem, "subtotal">) => void;
  removeFromCart: (item_id: string, selected_size: string) => void;
  updateQuantity: (item_id: string, selected_size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isHydrated: boolean;
}

const STORAGE_KEY = "arihant-cart-v3";

/* ───────────────── context ───────────────── */
const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch (err) {
      console.error("Cart hydration failed:", err);
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isHydrated]);

  const addToCart = useCallback((entry: Omit<CartItem, "subtotal">) => {
    setItems((prev) => {
      // Ensure IDs are strings for comparison
      const entryId = String(entry.item_id);
      
      const idx = prev.findIndex(
        (i) => String(i.item_id) === entryId && i.selected_size === entry.selected_size
      );
      
      const price = Number(entry.price) || 0;
      const quantity = Number(entry.quantity) || 0;

      if (idx >= 0) {
        const updated = [...prev];
        const existing = updated[idx];
        const newQty = existing.quantity + quantity;
        updated[idx] = { 
          ...existing, 
          quantity: newQty, 
          subtotal: price * newQty 
        };
        console.log("Cart: Incremented quantity for", entry.item_name);
        return updated;
      }
      
      console.log("Cart: Added new item", entry.item_name);
      return [...prev, { 
        ...entry, 
        item_id: entryId,
        price,
        quantity,
        subtotal: price * quantity 
      }];
    });
  }, []);

  const removeFromCart = useCallback((item_id: string, selected_size: string) => {
    const stringId = String(item_id);
    setItems((prev) => prev.filter((i) => !(String(i.item_id) === stringId && i.selected_size === selected_size)));
  }, []);

  const updateQuantity = useCallback((item_id: string, selected_size: string, quantity: number) => {
    const stringId = String(item_id);
    const newQty = Math.max(1, Number(quantity) || 1);
    
    setItems((prev) =>
      prev.map((i) =>
        String(i.item_id) === stringId && i.selected_size === selected_size
          ? { 
              ...i, 
              quantity: newQty, 
              subtotal: i.price * newQty 
            }
          : i
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);
  const totalPrice = items.reduce((sum, i) => sum + (Number(i.subtotal) || 0), 0);

  return (
    <CartContext.Provider value={{ 
      items, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      totalItems, 
      totalPrice,
      isHydrated 
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
