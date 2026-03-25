/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCartStore } from "@/store/cartStore";
import api from "@/lib/api";
import { Star, Truck, ShieldCheck, ArrowLeft, Plus, Minus, ShoppingBag, Ruler, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        setProduct(res.data);
        if (res.data.sizes?.length > 0) setSelectedSize(res.data.sizes[0].size);
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
      productId: product._id,
      name: product.name,
      price: product.price,
      size: selectedSize,
      quantity,
      image: product.images?.[0]
    });
    // Optional: show toast or redirect to cart
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/selector" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-primary mb-8 transition-colors">
            <ArrowLeft size={16} /> Back to selection
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Image Gallery */}
            <div className="space-y-4">
            <div className="aspect-[4/5] bg-brand-bg/30 rounded-[40px] overflow-hidden shadow-2xl shadow-brand-primary/10 group">
              <img 
                src={product.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"; }}
              />
            </div>
            {/* Image Gallery Thumbnails */}
            <div className="grid grid-cols-4 gap-4">
              {(product.images || [null, null, null, null]).slice(0, 4).map((img: string, i: number) => (
                <div key={i} className="aspect-square bg-white rounded-3xl border-2 border-brand-primary/5 overflow-hidden hover:border-brand-primary transition-all cursor-pointer">
                  <img 
                    src={img || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"} 
                    alt="Gallery" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"; }}
                  />
                </div>
              ))}
            </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="mb-8">
                <div className="text-xs uppercase tracking-[0.2em] text-brand-primary font-bold mb-3">{product.category}</div>
                <h1 className="text-4xl font-heading text-brand-secondary mb-4 leading-tight">{product.name}</h1>
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-3xl font-bold text-brand-primary">₹{product.price}</div>
                  <div className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full border border-green-100 uppercase tracking-wider">In Stock</div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-8">{product.description}</p>
              </div>

              {/* Size Selector */}
              <div className="mb-8 p-6 bg-brand-bg/10 rounded-3xl border border-brand-primary/5">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-heading text-brand-secondary">Select Size</h3>
                  {product.sizeGuide && (
                    <button 
                      onClick={() => setShowSizeGuide(true)}
                      className="text-xs text-brand-primary font-bold hover:underline flex items-center gap-1"
                    >
                      <Ruler size={14} /> Size Guide
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((s: any) => (
                    <button
                      key={s.size}
                      onClick={() => setSelectedSize(s.size)}
                      className={`min-w-[50px] h-12 flex items-center justify-center rounded-xl font-medium transition-all ${selectedSize === s.size ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-white border border-brand-primary/10 text-brand-secondary hover:border-brand-primary/40'}`}
                    >
                      {s.size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity and Add to Cart */}
              <div className="flex items-center gap-6 mb-12">
                <div className="flex items-center bg-brand-bg/20 rounded-2xl p-1 border border-brand-primary/5">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-brand-secondary">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 flex items-center justify-center hover:bg-white rounded-xl transition-all"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="flex-grow h-14 bg-brand-secondary text-white rounded-2xl font-semibold shadow-xl shadow-brand-secondary/20 hover:bg-brand-secondary/90 transition-all flex items-center justify-center gap-3"
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

      {/* Size Guide Modal */}
      <AnimatePresence>
        {showSizeGuide && product.sizeGuide && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSizeGuide(false)}
              className="absolute inset-0 bg-brand-secondary/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-heading text-brand-secondary">{product.sizeGuide.type}</h2>
                  <p className="text-xs text-brand-primary font-bold uppercase tracking-widest mt-1">Unit: {product.sizeGuide.unit}</p>
                </div>
                <button 
                  onClick={() => setShowSizeGuide(false)}
                  className="p-3 bg-brand-bg/50 rounded-full hover:bg-brand-bg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-brand-primary/10">
                      <th className="py-4 font-heading text-brand-secondary">Size</th>
                      <th className="py-4 font-heading text-brand-secondary">Chest</th>
                      <th className="py-4 font-heading text-brand-secondary">Waist</th>
                      <th className="py-4 font-heading text-brand-secondary">Height</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {product.sizeGuide.sizes.map((s: any) => (
                      <tr key={s.size} className={selectedSize === s.size ? 'bg-brand-primary/5' : ''}>
                        <td className="py-4 font-bold text-brand-primary">{s.size}</td>
                        <td className="py-4 text-gray-600">{s.chest}</td>
                        <td className="py-4 text-gray-600">{s.waist}</td>
                        <td className="py-4 text-gray-600">{s.height}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-8 p-6 bg-brand-bg/10 rounded-2xl">
                  <h4 className="font-bold text-brand-secondary mb-3 text-sm">Measuring Instructions:</h4>
                  <ul className="space-y-2">
                    {product.sizeGuide.instructions.map((ins: string, i: number) => (
                      <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-brand-primary rounded-full mt-1.5 flex-shrink-0" />
                        {ins}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
