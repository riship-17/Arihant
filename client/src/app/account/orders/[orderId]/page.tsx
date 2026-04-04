"use client";

import { useEffect, useState, use } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { 
  ArrowLeft, Package, Truck, CheckCircle2, Clock, 
  MapPin, CreditCard, ShoppingBag, Info, ExternalLink 
} from "lucide-react";
import Link from "next/link";
import PageSpinner from "@/components/PageSpinner";

interface OrderItem {
  product: {
    name: string;
    image_url: string;
    item_type: string;
  };
  itemName: string;
  size: string;
  quantity: number;
  price_paisa: number;
}

interface Order {
  _id: string;
  orderStatus: 'pending' | 'processing' | 'confirmed' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'failed';
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    pincode: string;
    state: string;
  };
  razorpay_payment_id?: string;
  school?: { name: string };
  standard?: { class_name: string; gender: string };
}

type Params = Promise<{ orderId: string }>;

export default function OrderDetailPage({ params }: { params: Params }) {
  const { orderId } = use(params);
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setIsHydrated(true); }, []);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.push("/login");
    }
  }, [isHydrated, isAuthenticated, router]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/my-orders/${orderId}`);
      setOrder(res.data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to fetch order details:", err);
      setError(err.response?.status === 403 || err.response?.status === 404
        ? "Order not found or you don't have permission to view it."
        : "Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && orderId) {
      fetchOrderDetails();
    }
  }, [isAuthenticated, orderId]);

  const statusSteps = [
    { label: "Order Placed", status: "pending", icon: Clock },
    { label: "Processing", status: "processing", icon: Package },
    { label: "Shipped", status: "shipped", icon: Truck },
    { label: "Delivered", status: "delivered", icon: CheckCircle2 },
  ];

  const getStatusIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    const map: Record<string, number> = {
      'pending': 0,
      'processing': 1,
      'confirmed': 1,
      'packed': 1,
      'shipped': 2,
      'delivered': 3
    };
    return map[status] ?? 0;
  };

  if (!isHydrated || (loading && !order)) {
    return <PageSpinner message="Fetching order details..." />;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-bg/10">
        <Navbar />
        <main className="flex-grow py-20 px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Info size={40} />
            </div>
            <h1 className="text-3xl font-heading text-brand-secondary mb-4">Order Not Found</h1>
            <p className="text-gray-500 mb-8">{error || "We couldn't find the order you're looking for."}</p>
            <Link 
              href="/account/orders"
              className="inline-flex items-center gap-2 px-8 py-3 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 transition-all"
            >
              <ArrowLeft size={18} /> Back to My Orders
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(order.orderStatus);

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg/5">
      <Navbar />
      
      <main className="flex-grow py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <Link 
                href="/account/orders" 
                className="flex items-center gap-2 text-brand-primary font-bold text-sm mb-4 hover:underline"
              >
                <ArrowLeft size={16} /> Back to My Orders
              </Link>
              <h1 className="text-3xl font-heading text-brand-secondary flex flex-wrap items-center gap-3">
                Order <span className="text-brand-primary">#{order._id.slice(-8)}</span>
              </h1>
              <p className="text-gray-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            
            {order.orderStatus === 'cancelled' ? (
              <div className="px-6 py-2 bg-red-100 text-red-600 rounded-full font-bold border border-red-200 self-start sm:self-center">
                Cancelled
              </div>
            ) : (
              <div className="px-6 py-2 bg-green-50 text-green-600 rounded-full font-bold border border-green-200 self-start sm:self-center flex items-center gap-2">
                <CheckCircle2 size={16} /> {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Timeline & Items */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Status Timeline */}
              {order.orderStatus !== 'cancelled' && (
                <div className="bg-white p-8 rounded-[40px] border border-brand-primary/5 shadow-sm">
                  <h2 className="text-lg font-heading text-brand-secondary mb-8">Order Journey</h2>
                  <div className="relative flex justify-between">
                    {/* Background Progress Line */}
                    <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 -z-0"></div>
                    <div 
                      className="absolute top-5 left-0 h-1 bg-brand-primary transition-all duration-1000 -z-0"
                      style={{ width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%` }}
                    ></div>

                    {statusSteps.map((step, idx) => {
                      const Icon = step.icon;
                      const isCompleted = idx <= currentStatusIndex;
                      const isActive = idx === currentStatusIndex;
                      
                      return (
                        <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                            isCompleted ? 'bg-brand-primary text-white shadow-lg shadow-brand-primary/20' : 'bg-gray-100 text-gray-400'
                          }`}>
                            <Icon size={18} />
                          </div>
                          <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider text-center max-w-[60px] sm:max-w-none ${
                            isCompleted ? 'text-brand-primary' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Items List */}
              <div className="bg-white rounded-[40px] border border-brand-primary/5 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                  <h2 className="text-lg font-heading text-brand-secondary">Order Items</h2>
                  <span className="text-sm font-bold text-gray-400">{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="p-6 sm:p-8 flex items-center gap-6">
                      <div className="w-20 h-24 bg-brand-bg/20 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.product?.image_url ? (
                          <img src={item.product.image_url} alt={item.itemName} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="text-brand-secondary/20" />
                        )}
                      </div>
                      <div className="flex-grow">
                        <div className="text-[10px] font-bold text-brand-primary uppercase mb-1">
                          {order.school?.name || 'School Uniform'}
                        </div>
                        <h3 className="font-heading text-brand-secondary leading-tight mb-1">{item.itemName}</h3>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 font-medium">
                          <span>Size: <span className="text-brand-secondary font-bold uppercase">{item.size}</span></span>
                          {order.standard && (
                            <span>Class: <span className="text-brand-secondary font-bold uppercase">{order.standard.class_name} ({order.standard.gender})</span></span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-gray-400">Qty: {item.quantity} × ₹{item.price_paisa / 100}</div>
                        <div className="font-bold text-brand-secondary text-lg">₹{(item.price_paisa * item.quantity / 100).toLocaleString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Address & Payment Summary */}
            <div className="space-y-8">
              {/* Order Summary Card */}
              <div className="bg-brand-secondary text-white p-8 rounded-[40px] shadow-xl shadow-brand-secondary/20 relative overflow-hidden">
                <div className="relative z-10">
                  <h2 className="text-lg font-heading mb-6 flex items-center gap-2">
                    <ShoppingBag size={20} /> Summary
                  </h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-white/70 text-sm">
                      <span>Subtotal</span>
                      <span>₹{(order.totalAmount / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-white/70 text-sm">
                      <span>Delivery</span>
                      <span className="text-green-300 font-bold uppercase text-[10px]">Free</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                    <span className="text-sm font-medium">Total Paid</span>
                    <span className="text-3xl font-heading text-white">₹{(order.totalAmount / 100).toLocaleString()}</span>
                  </div>
                </div>
                {/* Decorative Pattern */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white p-8 rounded-[40px] border border-brand-primary/5 shadow-sm">
                <h2 className="text-lg font-heading text-brand-secondary mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-brand-primary" /> Delivery Details
                </h2>
                <div className="space-y-1">
                  <div className="font-bold text-brand-secondary">{order.shippingAddress.fullName}</div>
                  <div className="text-sm text-gray-500 leading-relaxed">
                    {order.shippingAddress.street},<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state},<br />
                    {order.shippingAddress.pincode}
                  </div>
                  <div className="pt-4 text-sm font-bold text-brand-primary flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-brand-primary/10 flex items-center justify-center">
                      <Truck size={14} />
                    </div>
                    {order.shippingAddress.phone}
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white p-8 rounded-[40px] border border-brand-primary/5 shadow-sm">
                <h2 className="text-lg font-heading text-brand-secondary mb-6 flex items-center gap-2">
                  <CreditCard size={20} className="text-brand-primary" /> Payment Method
                </h2>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-medium text-gray-500">Razorpay Info</div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.paymentStatus}
                  </div>
                </div>
                {order.razorpay_payment_id && (
                  <div className="p-4 bg-brand-bg/30 rounded-2xl space-y-2">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Transaction ID</div>
                    <div className="text-xs font-mono text-brand-secondary break-all flex items-center gap-2">
                      {order.razorpay_payment_id.slice(0, 8)}...{order.razorpay_payment_id.slice(-4)}
                      <ExternalLink size={12} className="opacity-30" />
                    </div>
                  </div>
                )}
                {!order.razorpay_payment_id && (
                  <div className="text-sm text-gray-500 italic">Cash on Delivery (Pending)</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
