"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CartSummaryBar() {
  const { totalItems, totalPrice } = useCart();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50">
      {/* blur backdrop */}
      <div className="bg-white/80 backdrop-blur-xl border-t border-brand-primary/10 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          {/* left: summary */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart size={22} className="text-brand-primary" />
              <span className="absolute -top-2 -right-2.5 h-5 w-5 bg-brand-accent text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            </div>
            <div className="hidden sm:block">
              <span className="text-sm text-gray-500">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
              <span className="mx-2 text-gray-300">•</span>
            </div>
            <span className="text-lg font-bold text-brand-secondary">
              ₹{totalPrice.toLocaleString("en-IN")}
            </span>
          </div>

          {/* right: CTA */}
          <Link
            href="/cart"
            className="px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all flex items-center gap-2 group"
          >
            View Cart
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
}
