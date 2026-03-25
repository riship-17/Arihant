/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { ArrowLeft, ShoppingBag, Plus, Minus, Package, Info } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useUniformStore } from "@/store/uniformStore";

export default function KitCustomizationPage() {
  const router = useRouter();
  const { schoolId } = useParams();
  const gender = useUniformStore((state) => state.gender);
  const classNum = useUniformStore((state) => state.classRange);

  const [kitData, setKitData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for customization
  const [selections, setSelections] = useState<Record<string, { size: string; quantity: number; selected: boolean }>>({});
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    const fetchKit = async () => {
      try {
        const res = await api.get("/kits", {
          params: { schoolId, classRange: classNum, gender }
        });
        
        const kit = res.data;
        setKitData(kit);
        
        // Initialize selections state based on kit items
        const initialSelections: Record<string, any> = {};
        kit.items.forEach((item: any) => {
          const product = item.product;
          initialSelections[product._id] = {
            size: product.sizes && product.sizes.length > 0 ? product.sizes[0].size : "",
            quantity: 1,
            selected: item.isDefault
          };
        });
        setSelections(initialSelections);
        
      } catch (err: any) {
        console.error(err);
        setError("Could not load kit for this selection. Try selecting a different class or gender.");
      } finally {
        setLoading(false);
      }
    };
    
    if (schoolId && gender && classNum) {
      fetchKit();
    }
  }, [schoolId, gender, classNum]);

  const updateSelection = (productId: string, field: string, value: any) => {
    setSelections((prev: any) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  };

  const calculateTotal = () => {
    if (!kitData) return 0;
    let total = 0;
    kitData.items.forEach((item: any) => {
      const selection = selections[item.product._id];
      if (selection && selection.selected) {
        total += item.product.price * selection.quantity;
      }
    });
    return total;
  };

  const addToCart = useCartStore((state) => state.addToCart);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      const selectedItems = kitData.items.filter((item: any) => selections[item.product._id]?.selected);

      // Validate that sizes are selected
      if (selectedItems.some((item: any) => !selections[item.product._id].size)) {
         alert("Please select sizes for all included items.");
         setAddingToCart(false);
         return;
      }

      selectedItems.forEach((item: any) => {
        addToCart({
          productId: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.images?.[0],
          size: selections[item.product._id].size,
          quantity: selections[item.product._id].quantity,
          schoolId: typeof schoolId === 'string' ? schoolId : undefined,
          isKitItem: true
        });
      });
      
      // Artificial delay for UX
      await new Promise(r => setTimeout(r, 600));
      router.push('/cart');
    } catch (err) {
      console.error("Error adding kit to cart", err);
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !kitData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow py-16 px-4">
          <div className="max-w-2xl mx-auto text-center">
             <div className="inline-flex w-16 h-16 rounded-full bg-red-50 text-red-500 items-center justify-center mb-6">
                <Info size={32} />
             </div>
             <h2 className="text-3xl font-heading text-brand-secondary mb-4">No Kit Found</h2>
             <p className="text-gray-600 mb-8">{error}</p>
             <button 
                onClick={() => router.back()}
                className="px-8 py-4 bg-brand-primary text-white rounded-2xl font-bold hover:bg-brand-primary/90 transition-all"
             >
                Go Back
             </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Kit Header */}
      <div className="bg-white border-b border-gray-200 py-10">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-500 hover:text-brand-primary transition-colors mb-6"
            >
              <ArrowLeft size={20} /> Back
            </button>
            <div className="flex items-center gap-6">
               <div className="w-20 h-20 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary">
                  {kitData.schoolId?.logo ? (
                     <img src={kitData.schoolId.logo} className="w-12 h-12 object-contain" alt="School Logo" />
                  ) : (
                     <Package size={36} />
                  )}
               </div>
               <div>
                  <h1 className="text-3xl font-heading text-brand-secondary">{kitData.schoolId?.name || "School"} Kit</h1>
                  <p className="text-gray-500 text-lg mt-1">Class {classNum} • {gender}</p>
               </div>
            </div>
         </div>
      </div>

      <main className="flex-grow py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
             
             {/* Kit Items List */}
             <div className="w-full lg:w-2/3 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Customize Your Kit</h2>
                {kitData.items.map((item: any) => {
                   const product = item.product;
                   const selection = selections[product._id];
                   if (!selection) return null;

                   return (
                      <div 
                         key={product._id} 
                         className={`bg-white rounded-3xl p-6 border-2 transition-all flex flex-col sm:flex-row gap-6 ${selection.selected ? 'border-brand-primary/20 shadow-xl shadow-brand-primary/5' : 'border-transparent shadow-sm opacity-60'}`}
                      >
                         <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-2xl overflow-hidden shrink-0">
                            <img src={product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80'} className="w-full h-full object-contain" alt={product.name} />
                         </div>
                         <div className="flex-grow flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                               <div>
                                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                                  <p className="text-brand-primary font-bold text-lg mt-1">₹{product.price}</p>
                               </div>
                               <button 
                                  onClick={() => updateSelection(product._id, 'selected', !selection.selected)}
                                  className={`p-2 rounded-xl border text-sm font-semibold transition-all ${selection.selected ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' : 'bg-brand-primary/10 text-brand-primary border-brand-primary/20 hover:bg-brand-primary hover:text-white'}`}
                               >
                                  {selection.selected ? 'Remove' : 'Add to Kit'}
                               </button>
                            </div>
                            
                            {selection.selected && (
                               <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-gray-100">
                                  {/* Size Selector */}
                                  <div>
                                     <span className="text-sm text-gray-500 block mb-2 font-medium">Size</span>
                                     <div className="flex gap-2">
                                        {product.sizes?.map((sz: any) => (
                                           <button 
                                             key={sz.size}
                                             onClick={() => updateSelection(product._id, 'size', sz.size)}
                                             className={`w-10 h-10 rounded-lg text-sm font-bold border transition-all ${selection.size === sz.size ? 'bg-brand-primary text-white border-brand-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-primary'}`}
                                           >
                                              {sz.size}
                                           </button>
                                        ))}
                                     </div>
                                  </div>
                                  
                                  {/* Quantity Selector */}
                                  <div>
                                     <span className="text-sm text-gray-500 block mb-2 font-medium">Quantity</span>
                                     <div className="flex items-center bg-gray-100 rounded-lg p-1">
                                        <button 
                                          onClick={() => updateSelection(product._id, 'quantity', Math.max(1, selection.quantity - 1))}
                                          className="w-8 h-8 rounded-md bg-white text-gray-600 shadow-sm flex items-center justify-center hover:text-brand-primary"
                                        >
                                           <Minus size={14} />
                                        </button>
                                        <span className="w-10 text-center font-bold text-sm">{selection.quantity}</span>
                                        <button 
                                          onClick={() => updateSelection(product._id, 'quantity', selection.quantity + 1)}
                                          className="w-8 h-8 rounded-md bg-white text-gray-600 shadow-sm flex items-center justify-center hover:text-brand-primary"
                                        >
                                           <Plus size={14} />
                                        </button>
                                     </div>
                                  </div>
                               </div>
                            )}
                         </div>
                      </div>
                   )
                })}
             </div>

             {/* Order Summary Sidebar */}
             <div className="w-full lg:w-1/3">
                <div className="bg-white rounded-3xl p-8 border border-brand-primary/10 shadow-xl shadow-brand-primary/5 sticky top-8">
                   <h3 className="text-xl font-bold text-gray-900 mb-6">Kit Summary</h3>
                   
                   <div className="space-y-4 mb-6">
                      {kitData.items.filter((i: any) => selections[i.product._id]?.selected).map((item: any) => {
                         const selection = selections[item.product._id];
                         return (
                            <div key={item.product._id} className="flex justify-between text-sm">
                               <span className="text-gray-600">{item.product.name} (x{selection.quantity})</span>
                               <span className="font-semibold text-gray-900">₹{item.product.price * selection.quantity}</span>
                            </div>
                         )
                      })}
                      {kitData.items.filter((i: any) => selections[i.product._id]?.selected).length === 0 && (
                         <p className="text-gray-400 text-sm italic">No items selected.</p>
                      )}
                   </div>
                   
                   <div className="pt-4 border-t border-gray-100 mb-8 flex justify-between items-end">
                      <span className="text-gray-500 font-medium">Total Balance</span>
                      <span className="text-3xl font-bold text-brand-primary">₹{calculateTotal()}</span>
                   </div>

                   <button 
                     onClick={handleAddToCart}
                     disabled={addingToCart || calculateTotal() === 0}
                     className="w-full py-5 bg-brand-primary text-white rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all disabled:opacity-50 disabled:shadow-none"
                   >
                     {addingToCart ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShoppingBag size={22} />
                          Add Kit to Cart
                        </>
                      )}
                   </button>
                </div>
             </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
