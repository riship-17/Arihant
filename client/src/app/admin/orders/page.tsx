/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Eye, X, ShoppingBag } from "lucide-react";
import { InlineSpinner } from "@/components/PageSpinner";
import ErrorBanner from "@/components/ErrorBanner";
import EmptyState from "@/components/EmptyState";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [editStatus, setEditStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/admin/orders");
      setOrders(res.data.orders);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    setUpdating(true);
    try {
      const payload: any = { order_status: editStatus };
      if (editStatus === 'shipped') {
        payload.tracking_number = trackingNumber;
      }
      await api.patch(`/admin/orders/${selectedOrder._id}/status`, payload);
      alert("Status updated successfully!");
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) => filter === "all" || order.order_status === filter
  );

  if (loading) return <div className="p-8">Loading orders...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading text-brand-secondary">Manage Orders</h1>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 min-h-[400px]">
        {/* Filters */}
        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {["all", "pending", "confirmed", "packed", "shipped", "delivered", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all whitespace-nowrap ${
                filter === status
                  ? "bg-brand-secondary text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-brand-primary/10 hover:text-brand-primary"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20">
            <InlineSpinner message="Fetching orders..." />
          </div>
        ) : error ? (
          <div className="py-10">
            <ErrorBanner type="server" message={error} onRetry={fetchOrders} />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-10">
            <EmptyState 
              icon={ShoppingBag} 
              title={filter === "all" ? "No Orders Yet" : `No ${filter} orders`} 
              description={filter === "all" ? "There are no orders in the system yet." : `There are no orders with status '${filter}' right now.`} 
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-sm text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="pb-4 font-normal">Order ID</th>
                  <th className="pb-4 font-normal">Date</th>
                  <th className="pb-4 font-normal">Customer</th>
                  <th className="pb-4 font-normal">Status</th>
                  <th className="pb-4 font-normal">Total</th>
                  <th className="pb-4 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="py-4 font-medium text-brand-secondary">#{order._id.slice(-6)}</td>
                    <td className="py-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                    <td className="py-4 text-gray-500">{order.user_id?.name || "Guest"}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        order.order_status === 'delivered' ? 'bg-green-100 text-green-600' :
                        order.order_status === 'cancelled' ? 'bg-red-100 text-red-600' :
                        order.order_status === 'shipped' ? 'bg-blue-100 text-blue-600' :
                        'bg-orange-100 text-orange-600'
                      }`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="py-4 font-bold text-brand-secondary">₹{order.total_paisa / 100}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedOrder(order);
                          setEditStatus(order.order_status);
                          setTrackingNumber(order.tracking_number || "");
                        }}
                        className="text-brand-primary hover:bg-brand-primary/10 p-2 rounded-full inline-flex items-center justify-center transition-colors"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-xl font-heading text-brand-secondary">Order #{selectedOrder._id}</h2>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs uppercase font-bold text-gray-400 mb-2">Customer Details</h3>
                  <p className="font-bold text-brand-secondary">{selectedOrder.user_id?.name}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.user_id?.email}</p>
                  <p className="text-sm text-gray-500">{selectedOrder.user_id?.phone}</p>
                </div>
                <div>
                  <h3 className="text-xs uppercase font-bold text-gray-400 mb-2">Shipping Address</h3>
                  <p className="text-sm text-gray-600">
                    {selectedOrder.address}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-xs uppercase font-bold text-gray-400 mb-4">Ordered Items</h3>
                <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                  {selectedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <div className="flex gap-3">
                        <img src={item.product_id?.image_url} alt="" className="w-12 h-12 rounded object-cover" />
                        <div>
                          <div className="font-semibold text-brand-secondary">
                            {item.quantity}x {item.product_name_snapshot}
                          </div>
                          <div className="text-gray-400 text-xs mt-1">Size: {item.size_snapshot}</div>
                        </div>
                      </div>
                      <div className="text-gray-600 self-center">₹{(item.price_paisa_snapshot * item.quantity)/100}</div>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between font-bold text-brand-secondary">
                    <span>Grand Total</span>
                    <span className="text-brand-primary">₹{selectedOrder.total_paisa / 100}</span>
                  </div>
                </div>
              </div>

              {/* Status Update Form */}
              <div className="bg-brand-bg/30 p-6 rounded-2xl border border-brand-primary/10">
                <h3 className="text-sm font-bold text-brand-secondary mb-4">Update Fulfillment Status</h3>
                <div className="space-y-4">
                  <div>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {editStatus === 'shipped' && (
                    <div>
                      <input
                        type="text"
                        placeholder="Enter Tracking Number or Courier link"
                        value={trackingNumber}
                        onChange={(e) => setTrackingNumber(e.target.value)}
                        className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-primary/20 outline-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={handleUpdateStatus}
                    disabled={updating}
                    className="w-full py-3 bg-brand-primary text-white font-bold rounded-xl hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
                  >
                    {updating ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
