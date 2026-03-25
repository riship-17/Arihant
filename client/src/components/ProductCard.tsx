/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";

interface ProductCardProps {
  product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="bg-white rounded-3xl border border-brand-primary/5 overflow-hidden group hover:shadow-xl hover:shadow-brand-primary/5 transition-all duration-300">
      <div className="relative aspect-[4/5] bg-brand-bg/20 overflow-hidden">
        {/* Product Image */}
        <img 
          src={product.imageUrl || product.images?.[0] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"} 
          alt={product.itemName || product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800"; }}
        />
        
        {/* Hover Actions */}
        <div className="absolute inset-0 bg-brand-secondary/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Link 
            href={`/products/${product._id}`}
            className="p-3 bg-white text-brand-secondary rounded-full hover:bg-brand-primary hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
          >
            <Eye size={20} />
          </Link>
          <button className="p-3 bg-brand-primary text-white rounded-full hover:bg-brand-primary/90 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-6">
        <div className="text-[10px] uppercase tracking-widest text-brand-primary font-bold mb-1 opacity-70">
          {product.itemType || product.category}
        </div>
        <h3 className="text-lg font-heading text-brand-secondary mb-2 line-clamp-1">{product.itemName || product.name}</h3>
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold text-brand-primary">₹{product.price}</div>
          {product.standard?.className && (
            <div className="text-xs text-gray-400">{product.standard.className}</div>
          )}
        </div>
      </div>
    </div>
  );
}
