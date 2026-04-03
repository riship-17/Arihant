/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useCallback } from "react";
import { Minus, Plus, ShoppingBag, Check, AlertTriangle } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface VariantEntry {
  _id: string;
  size: string;
  stock_qty: number;
  is_available: boolean;
}

interface CatalogueItem {
  _id: string;
  name: string;
  item_type: string;
  price_paisa: number;
  image_url: string;
  variants: VariantEntry[];
}

export default function CatalogueItemCard({ item }: { item: CatalogueItem }) {
  const { addToCart } = useCart();

  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [addedFeedback, setAddedFeedback] = useState(false);

  /* derived */
  const selectedVariant = item.variants?.find((v) => v.size === selectedSize);
  const maxStock = selectedVariant?.stock_qty ?? 0;
  const lowStock = maxStock > 0 && maxStock <= 3;

  /* handlers */
  const handleSizeSelect = useCallback(
    (size: string) => {
      const variant = item.variants?.find((v) => v.size === size);
      if (!variant || variant.stock_qty === 0) return;   // can't select OOS
      setSelectedSize(size);
      setQuantity(variant.stock_qty > 0 ? 1 : 0);        // reset qty to 1 on size change
    },
    [item.variants]
  );

  const handleMinus = () => {
    if (!selectedSize) return;
    setQuantity((q) => Math.max(0, q - 1));
  };

  const handlePlus = () => {
    if (!selectedSize) return;
    setQuantity((q) => Math.min(maxStock, q + 1));
  };

  const handleAddToCart = () => {
    if (!selectedSize || quantity === 0) return;

    addToCart({
      item_id: item._id,
      item_name: item.name,
      item_type: item.item_type,
      image_url: item.image_url,
      price: item.price_paisa / 100,
      selected_size: selectedSize,
      quantity,
    });

    // flash feedback
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
      setQuantity(0);
      setSelectedSize(null);
    }, 1200);
  };

  const canAdd = selectedSize !== null && quantity > 0 && !addedFeedback;

  /* colour helpers based on item type */
  const typeColors: Record<string, string> = {
    shirt: "bg-blue-50 text-blue-600 border-blue-100",
    pant: "bg-amber-50 text-amber-600 border-amber-100",
    skirt: "bg-pink-50 text-pink-600 border-pink-100",
    tie: "bg-indigo-50 text-indigo-600 border-indigo-100",
    belt: "bg-stone-100 text-stone-600 border-stone-200",
    socks: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };
  const typeBadge = typeColors[item.item_type] ?? "bg-gray-50 text-gray-600 border-gray-100";

  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300 flex flex-col">
      {/* ─── Image ─── */}
      <div className="relative aspect-[4/5] bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden group">
        <img
          src={item.image_url || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src =
              "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800";
          }}
        />

        {/* type badge */}
        <span
          className={`absolute top-4 left-4 px-3 py-1 text-[10px] uppercase font-bold tracking-widest rounded-full border ${typeBadge}`}
        >
          {item.item_type}
        </span>
      </div>

      {/* ─── Body ─── */}
      <div className="p-5 flex flex-col flex-grow gap-4">
        {/* name + price */}
        <div>
          <h3 className="text-lg font-heading text-brand-secondary leading-snug line-clamp-2 mb-1">
            {item.name}
          </h3>
          <div className="text-2xl font-bold text-brand-primary">₹{item.price_paisa > 0 ? (item.price_paisa / 100).toFixed(0) : 'TBD'}</div>
        </div>

        {/* ─── Size Selector ─── */}
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Select Size
          </span>
          <div className="flex flex-wrap gap-2">
            {(item.variants || []).map((s) => {
              const outOfStock = s.stock_qty === 0;
              const isSelected = selectedSize === s.size;

              return (
                <button
                  key={s.size}
                  disabled={outOfStock}
                  onClick={() => handleSizeSelect(s.size)}
                  className={`
                    min-w-[44px] h-10 px-2 rounded-xl text-sm font-bold border transition-all
                    ${outOfStock
                      ? "bg-gray-100 text-gray-300 border-gray-100 cursor-not-allowed line-through"
                      : isSelected
                        ? "bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20 scale-105"
                        : "bg-white text-gray-600 border-gray-200 hover:border-brand-primary/40 hover:text-brand-primary"
                    }
                  `}
                >
                  {s.size}
                </button>
              );
            })}
          </div>

          {/* low stock warning */}
          {selectedSize && lowStock && (
            <div className="flex items-center gap-1.5 mt-2 text-amber-600 text-xs font-semibold animate-pulse">
              <AlertTriangle size={13} />
              Only {maxStock} left!
            </div>
          )}
        </div>

        {/* ─── Quantity Selector ─── */}
        <div>
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Quantity
          </span>
          <div
            className={`inline-flex items-center rounded-xl border transition-all ${
              !selectedSize ? "opacity-40 pointer-events-none border-gray-200" : "border-gray-200"
            }`}
          >
            <button
              onClick={handleMinus}
              disabled={!selectedSize || quantity <= 0}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-l-xl transition-colors disabled:opacity-30"
            >
              <Minus size={16} />
            </button>
            <span className="w-12 text-center font-bold text-brand-secondary tabular-nums">
              {quantity}
            </span>
            <button
              onClick={handlePlus}
              disabled={!selectedSize || quantity >= maxStock}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-brand-primary hover:bg-brand-primary/5 rounded-r-xl transition-colors disabled:opacity-30"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* spacer */}
        <div className="flex-grow" />

        {/* ─── Add to Cart Button ─── */}
        <button
          onClick={handleAddToCart}
          disabled={!canAdd}
          className={`
            w-full py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all
            ${addedFeedback
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
              : canAdd
                ? "bg-brand-primary text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 active:scale-[0.98]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {addedFeedback ? (
            <>
              <Check size={18} /> Added ✓
            </>
          ) : (
            <>
              <ShoppingBag size={18} /> Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}
