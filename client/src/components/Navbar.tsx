"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart, User, Menu, LogOut, Package, X, Home, BookOpen, School } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuthStore } from "@/store/authStore";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const { totalItems, isHydrated: cartHydrated } = useCart();
  const { isAuthenticated, fullLogout, user } = useAuthStore();
  const { clearCart } = useCart();
  const [isHydrated, setIsHydrated] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => { setIsHydrated(true); }, []);

  // Close mobile drawer on route change
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleLogout = () => {
    clearCart();      // wipe cart state + storage
    fullLogout();     // reset auth + checkout + uniform + filter + all storage
    router.push("/");
  };

  const navLinks = [
    { label: "Home", href: "/", icon: Home },
    { label: "School Uniforms", href: "/uniform/select-school", icon: School },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 w-full bg-brand-bg/80 backdrop-blur-md border-b border-brand-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
                <img src="/logo.png" alt="Arihant Store" className="h-10 w-auto" />

              </Link>
            </div>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? "text-brand-primary font-bold"
                      : "hover:text-brand-primary text-gray-600"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Desktop auth controls */}
              {isHydrated && !isAuthenticated ? (
                <div className="hidden sm:flex items-center space-x-3 mr-2">
                  <Link href="/login" className="text-sm font-medium text-brand-secondary hover:text-brand-primary">Login</Link>
                  <Link href="/register" className="text-sm font-medium bg-brand-primary text-white px-4 py-2 rounded-xl hover:bg-brand-primary/90">Register</Link>
                </div>
              ) : isHydrated && isAuthenticated ? (
                <div className="hidden sm:flex items-center space-x-4 mr-2">
                  {user?.role === "admin" && (
                    <Link href="/admin" className="text-sm font-bold text-white bg-brand-secondary px-4 py-2 rounded-xl hover:bg-brand-secondary/90 shadow-md">
                      Admin
                    </Link>
                  )}
                  <Link href="/orders" className="text-sm font-medium text-brand-secondary hover:text-brand-primary flex items-center gap-1">
                    <Package size={16} /> Orders
                  </Link>
                  <button onClick={handleLogout} className="text-sm font-medium text-red-500 hover:text-red-700 flex items-center gap-1">
                    <LogOut size={16} /> Logout
                  </button>
                  <div className="w-8 h-8 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary font-bold text-sm" title={user?.name}>
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                </div>
              ) : null}

              {/* Cart icon — always visible */}
              <Link href="/cart" className="p-2 hover:bg-brand-primary/5 rounded-full transition-colors relative">
                <ShoppingCart size={20} className="text-brand-secondary" />
                <span className="absolute top-0 right-0 h-4 w-4 bg-brand-accent text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                  {cartHydrated ? totalItems : 0}
                </span>
              </Link>

              {/* Hamburger — mobile only */}
              <button
                className="md:hidden p-2 hover:bg-brand-primary/5 rounded-full transition-colors"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={20} className="text-brand-secondary" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white z-[70] shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
            <span className="text-xl font-heading text-brand-secondary">Arihant<span className="text-brand-primary">Store</span></span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 hover:bg-gray-100 rounded-full" aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-grow p-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                  pathname === link.href
                    ? "bg-brand-primary/10 text-brand-primary font-bold"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon size={18} /> {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile auth section */}
        <div className="p-6 border-t border-gray-100 space-y-3">
          {isHydrated && !isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="block w-full text-center py-3 border-2 border-brand-primary text-brand-primary rounded-xl font-bold hover:bg-brand-primary/5 transition-all"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block w-full text-center py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-all"
              >
                Register
              </Link>
            </>
          ) : isHydrated && isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-brand-primary font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-brand-secondary text-sm">{user?.name}</div>
                  <div className="text-xs text-gray-400">{user?.email}</div>
                </div>
              </div>
              {user?.role === "admin" && (
                <Link href="/admin" className="block w-full text-center py-3 bg-brand-secondary text-white rounded-xl font-bold">
                  Admin Dashboard
                </Link>
              )}
              <Link href="/orders" className="flex items-center gap-2 px-4 py-3 rounded-xl text-brand-secondary hover:bg-gray-50 font-medium">
                <Package size={18} /> My Orders
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 font-medium w-full"
              >
                <LogOut size={18} /> Logout
              </button>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
