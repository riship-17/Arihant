"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/cartStore";
import { useCheckoutStore } from "@/store/checkoutStore";
import { CreditCard, Truck, MapPin, CheckCircle2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CheckoutPage() {
  const router = useRouter();
  const { items: cart, getSubtotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();
  const [loading, setLoading] = useState(false);
  
  const shippingAddress = useCheckoutStore((state) => state.shippingAddress);
  const setShippingAddress = useCheckoutStore((state) => state.setShippingAddress);
  const paymentMethod = useCheckoutStore((state) => state.paymentMethod);
  const setPaymentMethod = useCheckoutStore((state) => state.setPaymentMethod);
  const resetCheckout = useCheckoutStore((state) => state.resetCheckout);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create order in backend
      const res = await api.post("/orders", {
        items: cart.map(i => ({ product: i.productId, size: i.size, quantity: i.quantity, price: i.price })),
        shippingAddress: shippingAddress,
        paymentParams: { paymentMethod: paymentMethod },
        totalAmount: subtotal
      });

      // 2. Clear cart and redirect
      clearCart();
      resetCheckout();
      router.push(`/order-success?id=${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg/10">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-heading text-brand-secondary mb-10">Checkout</h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Shipping Info */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-8 rounded-3xl border border-brand-primary/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                    <MapPin size={20} />
                  </div>
                  <h2 className="text-xl font-heading text-brand-secondary">Shipping Address</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    required 
                    placeholder="Full Name" 
                    className="p-4 bg-brand-bg/20 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/30 outline-none"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ fullName: e.target.value })}
                  />
                  <input 
                    required 
                    placeholder="Phone Number" 
                    className="p-4 bg-brand-bg/20 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/30 outline-none"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ phone: e.target.value })}
                  />
                  <input 
                    required 
                    placeholder="Address Line 1" 
                    className="p-4 bg-brand-bg/20 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/30 outline-none md:col-span-2"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress({ addressLine1: e.target.value })}
                  />
                  <input 
                    required 
                    placeholder="City" 
                    className="p-4 bg-brand-bg/20 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/30 outline-none"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ city: e.target.value })}
                  />
                  <input 
                    required 
                    placeholder="State" 
                    className="p-4 bg-brand-bg/20 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/30 outline-none"
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ state: e.target.value })}
                  />
                  <input 
                    required 
                    placeholder="Zip Code" 
                    className="p-4 bg-brand-bg/20 rounded-2xl border-none focus:ring-2 focus:ring-brand-primary/30 outline-none"
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({ zipCode: e.target.value })}
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-8 rounded-3xl border border-brand-primary/5">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary">
                    <CreditCard size={20} />
                  </div>
                  <h2 className="text-xl font-heading text-brand-secondary">Payment Method</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {["UPI", "Card", "COD"].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-6 rounded-2xl border transition-all text-left flex flex-col gap-2 ${paymentMethod === m ? 'bg-brand-primary/5 border-brand-primary' : 'bg-white border-gray-100 hover:border-brand-primary/30'}`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === m ? 'border-brand-primary bg-brand-primary' : 'border-gray-300'}`}>
                        {paymentMethod === m && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                      <span className="font-bold text-brand-secondary">{m}</span>
                      <span className="text-[10px] text-gray-400">{m === 'COD' ? 'Pay upon delivery' : 'Instant & Secure'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Review */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl border border-brand-primary/5 sticky top-24">
                <h3 className="text-xl font-heading text-brand-secondary mb-6">Review Order</h3>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-gray-500">
                    <span>Products</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Delivery</span>
                    <span className="text-green-600 font-medium">FREE</span>
                  </div>
                  <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-xl text-brand-secondary">
                    <span>Total Amount</span>
                    <span>₹{subtotal}</span>
                  </div>
                </div>
                
                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full py-5 bg-brand-primary text-white rounded-2xl font-semibold shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Place Order"} <ArrowRight size={20} />
                </button>
                
                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                    <CheckCircle2 size={14} className="text-green-500" /> Secure SSL Encrypted Payment
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
