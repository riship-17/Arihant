"use client";

import Link from "next/link";
import { LayoutDashboard, Package, ShoppingCart, Users, ArrowLeft, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Customers", href: "/admin/customers", icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-secondary text-white flex-shrink-0 flex flex-col">
        <div className="p-8">
          <Link href="/" className="text-xl font-heading flex items-center gap-2">
            <ArrowLeft size={18} /> Arihant Store
          </Link>
          <div className="mt-2 text-[10px] uppercase tracking-widest opacity-50 font-bold">Admin Panel</div>
        </div>

        <nav className="flex-grow px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-white/10 text-white font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-white/5">
          <button className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
