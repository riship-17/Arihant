"use client";

import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle2, Package, ArrowRight, Download } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
        <CheckCircle2 size={48} />
      </div>
      
      <h1 className="text-4xl font-heading text-brand-secondary mb-4">Order Placed Successfully!</h1>
      <p className="text-gray-600 mb-10 text-lg">
        Thank you for shopping with Arihant Store. Your uniforms are being packed and will be shipped shortly.
      </p>

      <div className="bg-white p-8 rounded-3xl border border-brand-primary/10 shadow-xl shadow-brand-primary/5 mb-12 text-left">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-50 pb-6 mb-6">
          <div>
            <div className="text-xs uppercase tracking-widest text-gray-400 mb-1">Order ID</div>
            <div className="font-bold text-brand-secondary">#{orderId?.slice(-8).toUpperCase()}</div>
          </div>
          <button className="flex items-center gap-2 text-brand-primary font-bold text-sm bg-brand-primary/5 px-4 py-2 rounded-xl">
             <Download size={16} /> Download Invoice
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-gray-600">
            <div className="w-10 h-10 bg-brand-bg rounded-xl flex items-center justify-center text-brand-primary">
              <Package size={20} />
            </div>
            <div>
              <div className="font-bold text-brand-secondary text-sm">Estimated Delivery</div>
              <div className="text-xs">3-5 Business Days</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link 
          href="/" 
          className="w-full sm:w-auto px-10 py-5 bg-brand-primary text-white rounded-2xl font-semibold shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-3"
        >
          Return Home <ArrowRight size={20} />
        </Link>
        <Link 
          href="/orders" 
          className="w-full sm:w-auto px-10 py-5 bg-white text-brand-secondary rounded-2xl font-semibold border border-brand-secondary/10 hover:bg-brand-primary/5 transition-all"
        >
          Track Order
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col bg-brand-bg/10">
      <Navbar />
      <main className="flex-grow py-20 px-4">
        <Suspense fallback={<div>Loading...</div>}>
          <SuccessContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
