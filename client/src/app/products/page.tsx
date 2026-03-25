/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import api from "@/lib/api";
import { Filter, SlidersHorizontal } from "lucide-react";

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const school = searchParams.get("school");
        const classRange = searchParams.get("class");
        const gender = searchParams.get("gender");
        
        const res = await api.get("/products", {
          params: { school, classRange, gender }
        });
        setProducts(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* School Header */}
          {products.length > 0 && products[0].school && (
            <div className="mb-12 relative h-48 sm:h-64 rounded-[40px] overflow-hidden shadow-2xl shadow-brand-primary/10 group">
              <img 
                src={products[0].school.banner || "https://images.unsplash.com/photo-1523050853063-8802a8358445?auto=format&fit=crop&q=80&w=2000"} 
                alt="School Banner" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1523050853063-8802a8358445?auto=format&fit=crop&q=80&w=2000"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-8">
                <div className="flex items-center gap-6">
                  {products[0].school.logo && (
                    <div className="w-20 h-20 bg-white rounded-3xl p-3 flex items-center justify-center shadow-2xl transform -rotate-3">
                      <img 
                        src={products[0].school.logo} 
                        alt="Logo" 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl sm:text-5xl font-heading text-white drop-shadow-lg">{products[0].school.name}</h1>
                    <p className="text-white/80 font-medium tracking-wide mt-2">Official School Uniform Collection</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-3xl font-heading text-brand-secondary">
                {products.length > 0 && products[0].school ? "Uniform Catalog" : "All Uniforms"}
              </h1>
              <p className="text-sm text-gray-500 mt-1">Found {products.length} products matching your selection</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-3 bg-white border border-brand-primary/10 rounded-2xl text-sm font-bold shadow-lg shadow-black/5 hover:bg-brand-primary/5 transition-all">
              <Filter size={18} /> Filters
            </button>
          </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-[4/5] rounded-3xl mb-4" />
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-6 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
          <p className="text-gray-500">No products found for this selection.</p>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Suspense fallback={<div>Loading...</div>}>
          <ProductsContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
