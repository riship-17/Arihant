/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Plus, Minus, ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartPage() {
  const { items: cartItems, updateQuantity, removeFromCart, totalPrice, totalItems, isHydrated } = useCart();

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg/10">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-heading text-brand-secondary mb-10">Your Shopping Cart</h1>

          {cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Items List */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item, idx) => (
                  <div key={`${item.item_id}-${item.selected_size}-${idx}`} className="bg-white p-6 rounded-3xl border border-brand-primary/5 flex flex-col sm:flex-row gap-6 items-center">
                    <div className="w-24 h-24 bg-gray-50 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img src={item.image_url || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80'} className="w-full h-full object-contain mix-blend-multiply" alt="Product" />
                    </div>
                    <div className="flex-grow w-full">
                      <div className="flex justify-between items-start">
                         <div>
                            <h3 className="font-heading text-brand-secondary text-lg">{item.item_name || "Product"}</h3>
                            <div className="flex items-center gap-2 mt-1">
                               {item.is_kit_item && (
                                  <span className="px-2 py-0.5 bg-brand-primary/10 text-brand-primary rounded text-xs font-bold">Uniform Kit</span>
                               )}
                               {!item.is_kit_item && (
                                  <span className="px-2 py-0.5 bg-brand-secondary/10 text-brand-secondary rounded text-xs font-bold capitalize">{item.item_type}</span>
                               )}
                               <span className="text-sm text-gray-500">Size: {item.selected_size}</span>
                            </div>
                         </div>
                         <div className="font-bold text-lg text-brand-primary">₹{item.price * item.quantity}</div>
                      </div>
                      
                      <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center bg-gray-100 rounded-xl p-1">
                          <button onClick={() => updateQuantity(item.item_id, item.selected_size, item.quantity - 1)} className="p-1 hover:bg-white rounded-lg transition-all"><Minus size={14} /></button>
                          <span className="w-10 text-center text-sm font-bold tabular-nums">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.item_id, item.selected_size, item.quantity + 1)} className="p-1 hover:bg-white rounded-lg transition-all"><Plus size={14} /></button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.item_id, item.selected_size)}
                          className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-all text-sm font-semibold"
                        >
                          <Trash2 size={16} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white p-8 rounded-3xl border border-brand-primary/5 shadow-xl shadow-brand-primary/5 sticky top-24">
                  <h3 className="text-xl font-heading text-brand-secondary mb-6">Order Summary</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-medium">₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="text-green-600 font-bold">FREE</span>
                    </div>
                    <div className="border-t border-gray-100 pt-6 mt-6 flex justify-between font-bold text-2xl text-brand-secondary">
                      <span>Total</span>
                      <span className="text-brand-primary">₹{totalPrice.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  
                  <Link 
                    href="/checkout"
                    className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2"
                  >
                    Proceed to Checkout <ArrowRight size={20} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-[40px] border border-brand-primary/5 shadow-sm max-w-2xl mx-auto">
              <div className="w-24 h-24 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-primary">
                <ShoppingBag size={40} />
              </div>
              <h2 className="text-3xl font-heading text-brand-secondary mb-4">Your cart is empty</h2>
              <p className="text-gray-500 mb-10 text-lg">Looks like you haven&apos;t added anything yet.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                 <Link href="/casual" className="px-8 py-4 bg-white text-brand-secondary border-2 border-brand-primary rounded-2xl font-bold hover:bg-brand-primary/5 transition-all">
                   Shop Casual
                 </Link>
                 <Link href="/uniform/select-school" className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all">
                   Find School Uniforms
                 </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
