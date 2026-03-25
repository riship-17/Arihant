"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, User, Menu } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  const [mounted, setMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-brand-bg/80 backdrop-blur-md border-b border-brand-primary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-heading text-brand-primary">
              Arihant<span className="text-brand-secondary">Store</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium hover:text-brand-primary transition-colors">Home</Link>
            <Link href="/casual" className="text-sm font-medium hover:text-brand-primary transition-colors">Casual Wear</Link>
            <Link href="/uniform/select-school" className="text-sm font-medium hover:text-brand-primary transition-colors">School Uniforms</Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-brand-primary/5 rounded-full transition-colors">
              <User size={20} className="text-brand-secondary" />
            </button>
            <Link href="/cart" className="p-2 hover:bg-brand-primary/5 rounded-full transition-colors relative">
              <ShoppingCart size={20} className="text-brand-secondary" />
              <span className="absolute top-0 right-0 h-4 w-4 bg-brand-accent text-white text-[10px] flex items-center justify-center rounded-full">
                {mounted ? totalItems : 0}
              </span>
            </Link>
            <button className="md:hidden p-2 hover:bg-brand-primary/5 rounded-full transition-colors">
              <Menu size={20} className="text-brand-secondary" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
