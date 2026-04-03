/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import api from "@/lib/api";
import { Truck, ShieldCheck, ArrowLeft, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/uniform-items/${id}`);
        setProduct(res.data);
        if (res.data.variants?.length > 0) {
          // Select first available size
          const available = res.data.variants.find((s: any) => s.stock_qty > 0);
          if (available) setSelectedSize(available.size);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart({
      item_id: product._id,
      item_name: product.name,
      price: product.price_paisa / 100,
      selected_size: selectedSize,
      quantity,
      image_url: product.image_url,
      item_type: product.item_type
    });
  };

  const selectedVariant = product.variants?.find((s: any) => s.size === selectedSize);
  const maxStock = selectedVariant?.stock_qty ?? 0;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/uniform/select-school" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-primary mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to selection
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Image */}
            <div className="space-y-4">
            <div className="aspect-[4/5] bg-brand-bg/30 rounded-[40px] overflow-hidden shadow-2xl shadow-brand-primary/10 group">
              <img 
                src={product.image_url || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"; }}
              />
            </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-8">
                <div className="text-xs uppercase tracking-[0.2em] text-brand-primary font-bold mb-3">{product.item_type}</div>
                <h1 className="text-4xl font-heading text-brand-secondary mb-4 leading-tight">{product.name}</h1>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl font-bold text-brand-primary">₹{product.price_paisa > 0 ? (product.price_paisa / 100).toFixed(0) : 'TBD'}</div>
                  <div className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100 uppercase tracking-wider">In Stock</div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
              </div>

              {/* Size Selector */}
              <div className="mb-8 p-6 bg-brand-bg/10 rounded-3xl border border-brand-primary/5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-heading text-brand-secondary">Select Size</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                  {(product.variants || []).map((s: any) => (
                    <button
                      key={s.size}
                      disabled={s.stock_qty === 0}
                      onClick={() => {
                        setSelectedSize(s.size);
                        setQuantity(1);
                      }}
                      className={`min-w-[50px] h-12 flex items-center justify-center rounded-xl font-medium transition-all ${s.stock_qty === 0 ? 'opacity-30 line-through cursor-not-allowed' : selectedSize === s.size ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white border border-brand-primary/10 text-brand-secondary hover:border-brand-primary/40'}`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
                {selectedSize && maxStock <= 3 && maxStock > 0 && (
                  <p className="text-xs text-amber-600 font-bold mt-3">Only {maxStock} left in stock!</p>
                )}
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-6 mb-12">
                <div className="flex items-center bg-brand-bg/20 rounded-2xl p-1 border border-brand-primary/5">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={!selectedSize}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all disabled:opacity-30"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-brand-secondary tabular-nums">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(maxStock, quantity + 1))}
                    disabled={!selectedSize || quantity >= maxStock}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all disabled:opacity-30"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedSize || maxStock === 0}
                  className="flex-grow h-14 bg-brand-secondary text-white rounded-2xl font-semibold shadow-xl shadow-brand-secondary/20 hover:bg-brand-secondary/90 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <ShoppingBag size={20} /> Add to Cart
                </button>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Truck size={20} className="text-brand-primary" /> Delivery in 3-5 days
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <ShieldCheck size={20} className="text-brand-primary" /> Official School Apparel
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
