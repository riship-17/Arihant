"use client";

import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, School, ArrowLeft, LogOut, Menu, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useEffect, useState } from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, fullLogout } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/");
    } else {
      setIsAuthorized(true);
    }
  }, [isAuthenticated, user, router]);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Manage Schools", href: "/admin/schools", icon: School },
    { name: "Manage Uniforms", href: "/admin/products", icon: Package },
    { name: "Manage Orders", href: "/admin/orders", icon: ShoppingCart },
  ];

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-full border-4 border-brand-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    fullLogout();
    router.push("/");
  };

  const SidebarContent = () => (
    <>
      <div className="p-6 md:p-8 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <img src="/logo.png" alt="Arihant Logo" className="h-8 w-auto brightness-0 invert" />

        </Link>
        <div className="mt-2 text-[10px] uppercase tracking-widest opacity-50 font-bold ml-1">Admin Panel</div>
      </div>

      <nav className="flex-grow px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-white/15 text-white font-bold shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/8"
              }`}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 md:p-8 border-t border-white/10">
        <div className="mb-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-white text-sm font-semibold leading-tight">{user?.name}</div>
            <div className="text-white/40 text-xs leading-tight">{user?.email}</div>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-3 text-white/60 hover:text-white transition-colors text-sm">
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-brand-secondary text-white flex-shrink-0 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between bg-brand-secondary text-white px-4 py-3 sticky top-0 z-40">
        <Link href="/" className="text-lg font-heading flex items-center gap-2">
          <ArrowLeft size={16} /> Arihant Admin
        </Link>
        <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-white/10 rounded-full" aria-label="Open admin menu">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-brand-secondary text-white z-[60] flex flex-col transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <span className="font-heading text-lg">Admin Panel</span>
          <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-white/10 rounded-full" aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <SidebarContent />
      </div>

      {/* Main content */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
