/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Eye, Printer, Filter, CheckCircle2, Clock, Truck } from "lucide-react";

export default function OrderManagement() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Delivered': return 'bg-green-50 text-green-600 border-green-100';
      case 'Shipped': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading text-brand-secondary">Order Management</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium">
          <Filter size={16} /> Filter
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Order ID</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Customer</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Total</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Status</th>
              <th className="px-6 py-4 text-xs uppercase tracking-widest text-gray-400 font-bold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4 font-mono text-xs font-bold text-gray-400">#{order._id.slice(-8).toUpperCase()}</td>
                <td className="px-6 py-4">
                  <div className="font-bold text-brand-secondary text-sm">{order.user?.name || 'Guest'}</div>
                  <div className="text-[10px] text-gray-400">{order.shippingAddress?.phone}</div>
                </td>
                <td className="px-6 py-4 font-bold text-brand-primary">₹{order.totalAmount}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-widest ${getStatusColor(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors"><Eye size={18} /></button>
                    <button className="p-2 text-gray-400 hover:text-brand-primary transition-colors"><Printer size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="py-20 text-center text-gray-400 text-sm">No orders yet</div>
        )}
      </div>
    </div>
  );
}
