/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Plus, Edit, Trash2, Search } from "lucide-react";

export default function ProductManagement() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await api.get("/uniform-items");
        setItems(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchItems();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading text-brand-secondary">Inventory</h1>
        <button className="flex items-center gap-2 px-6 py-3 bg-brand-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-primary/20">
          <Plus size={18} /> Add Item
        </button>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm mb-6 flex items-center gap-4">
        <Search size={20} className="text-gray-400" />
        <input placeholder="Search uniform items..." className="flex-grow bg-transparent outline-none text-sm" />
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Item</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Type</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-bold">School</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Stock</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Price</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {items.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-brand-secondary text-sm">{p.itemName}</div>
                  <div className="text-[10px] text-gray-400">{p.standard?.className || ''}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{p.itemType}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.standard?.school?.name || ''}</td>
                <td className="px-6 py-4 font-bold">
                  {p.sizes.reduce((acc: number, s: any) => acc + s.stock, 0)} items
                </td>
                <td className="px-6 py-4 font-bold text-brand-primary">₹{p.price}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors"><Edit size={18} /></button>
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
