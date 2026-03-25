/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { useCheckoutStore } from "@/store/checkoutStore";
import { CreditCard, Truck, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cart, totalPrice: subtotal, clearCart, isHydrated } = useCart();
  const [loading, setLoading] = useState(false);
  
  const shippingAddress = useCheckoutStore((state) => state.shippingAddress);
  const setShippingAddress = useCheckoutStore((state) => state.setShippingAddress);
  const paymentMethod = useCheckoutStore((state) => state.paymentMethod);
  const setPaymentMethod = useCheckoutStore((state) => state.setPaymentMethod);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Mock order creation
      const orderData = {
        items: cart.map(item => ({
          product: item.item_id,
          name: item.item_name,
          quantity: item.quantity,
          size: item.selected_size,
          price: item.price
        })),
        shippingAddress,
        paymentMethod,
        totalAmount: subtotal,
      };

      const res = await api.post('/orders', orderData);
      
      if (res.data) {
        clearCart();
        router.push(`/orders/success?id=${res.data._id}`);
      }
    } catch (err) {
      console.error("Order error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-bg/10">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (cart.length === 0) {
    router.push('/cart');
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg/10">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-heading text-brand-secondary mb-10">Checkout</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: Forms */}
            <div className="lg:col-span-2 space-y-8">
              {/* Shipping Address */}
              <div className="bg-white p-8 rounded-[40px] border border-brand-primary/5 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                    <MapPin size={20} />
                  </div>
                  <h2 className="text-xl font-heading text-brand-secondary">Shipping Address</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1">Full Name</label>
                    <input 
                      required
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ fullName: e.target.value })}
                      className="w-full px-6 py-4 bg-brand-bg/20 border border-brand-primary/5 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" 
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1">Phone Number</label>
                    <input 
                      required
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ phone: e.target.value })}
                      className="w-full px-6 py-4 bg-brand-bg/20 border border-brand-primary/5 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" 
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1">Address Line</label>
                    <input 
                      required
                      value={shippingAddress.addressLine1}
                      onChange={(e) => setShippingAddress({ addressLine1: e.target.value })}
                      className="w-full px-6 py-4 bg-brand-bg/20 border border-brand-primary/5 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" 
                      placeholder="Street address, apartment, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-500 ml-1">City</label>
                    <input 
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ city: e.target.value })}
                      className="w-full px-6 py-4 bg-brand-bg/20 border border-brand-primary/5 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" 
                      placeholder="City"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-500 ml-1">State</label>
                      <input 
                        required
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ state: e.target.value })}
                        className="w-full px-6 py-4 bg-brand-bg/20 border border-brand-primary/5 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" 
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-500 ml-1">Pincode</label>
                      <input 
                        required
                        value={shippingAddress.zipCode}
                        onChange={(e) => setShippingAddress({ zipCode: e.target.value })}
                        className="w-full px-6 py-4 bg-brand-bg/20 border border-brand-primary/5 rounded-2xl focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all" 
                        placeholder="110001"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-8 rounded-[40px] border border-brand-primary/5 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                    <CreditCard size={20} />
                  </div>
                  <h2 className="text-xl font-heading text-brand-secondary">Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['UPI', 'COD'].map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${paymentMethod === method ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-100 hover:border-brand-primary/20'}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === method ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'}`}>
                          {paymentMethod === method && <CheckCircle2 size={14} className="text-white" />}
                        </div>
                        <span className="font-bold text-brand-secondary">{method === 'COD' ? 'Cash on Delivery' : 'UPI (PhonePe, Google Pay)'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[40px] border border-brand-primary/5 shadow-xl shadow-brand-primary/5 sticky top-24">
                <h3 className="text-xl font-heading text-brand-secondary mb-6">Order Summary</h3>
                
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="text-gray-600">
                        <span className="font-bold text-brand-secondary">{item.quantity}x</span> {item.item_name} ({item.selected_size})
                      </div>
                      <div className="font-bold text-brand-secondary">₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-100 mb-8">
                  <div className="flex justify-between text-gray-500">
                    <span>Products</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span className="text-green-600 font-bold uppercase text-xs">Free</span>
                  </div>
                  <div className="flex justify-between text-2xl font-bold text-brand-secondary pt-2">
                    <span>Total</span>
                    <span className="text-brand-primary">₹{subtotal}</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-5 bg-brand-secondary text-white rounded-2xl font-bold text-lg shadow-xl shadow-brand-secondary/20 hover:bg-brand-secondary/90 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  {loading ? 'Processing...' : (
                    <>
                      Place Order <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                
                <p className="text-center text-[10px] text-gray-400 mt-6 flex items-center justify-center gap-1">
                  <Truck size={12} /> Secure Checkout by Arihant Systems
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
