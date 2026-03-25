/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { Plus, Trash2, CheckCircle, Package } from "lucide-react";

export default function AdminKitsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedClass, setSelectedClass] = useState("5");
  const [selectedGender, setSelectedGender] = useState("Boys");
  const [loading, setLoading] = useState(true);

  // Kit Builder State
  const [kitItems, setKitItems] = useState<any[]>([]); // { product: id, isDefault: boolean, isOptional: boolean }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [schoolsRes, productsRes] = await Promise.all([
          api.get("/schools"),
          api.get("/products?baseCategory=uniform")
        ]);
        setSchools(schoolsRes.data);
        setProducts(productsRes.data);
        if (schoolsRes.data.length > 0) setSelectedSchool(schoolsRes.data[0]._id);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Attempt to load existing kit when parameters change
    const fetchKit = async () => {
      if (!selectedSchool) return;
      try {
        const res = await api.get("/kits", {
          params: { schoolId: selectedSchool, classRange: selectedClass, gender: selectedGender }
        });
        if (res.data && res.data.items) {
           setKitItems(res.data.items.map((i: any) => ({
              product: i.product._id,
              isDefault: i.isDefault,
              isOptional: i.isOptional
           })));
        }
      } catch (err: any) {
        // 404 means no kit exists yet, which is fine
        if (err.response?.status === 404) {
           setKitItems([]);
        } else {
           console.error("Error fetching kit:", err);
        }
      }
    };
    fetchKit();
  }, [selectedSchool, selectedClass, selectedGender]);

  const handleSaveKit = async () => {
    setSaving(true);
    try {
      await api.post("/kits", {
        schoolId: selectedSchool,
        classRange: selectedClass,
        gender: selectedGender,
        items: kitItems
      });
      alert("Kit saved successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to save kit.");
    } finally {
      setSaving(false);
    }
  };

  const toggleProductInKit = (productId: string) => {
     const exists = kitItems.find(i => i.product === productId);
     if (exists) {
        setKitItems(kitItems.filter(i => i.product !== productId));
     } else {
        setKitItems([...kitItems, { product: productId, isDefault: true, isOptional: false }]);
     }
  };

  if (loading) return <div className="p-10 text-center">Loading Admin...</div>;

  // Filter products to only show those belonging to the selected school (optional, but good UX)
  const availableProducts = products.filter(p => p.school?._id === selectedSchool);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-12 px-4 max-w-7xl mx-auto w-full">
         <div className="flex items-center gap-3 mb-8">
            <Package size={32} className="text-brand-primary" />
            <h1 className="text-3xl font-heading text-brand-secondary">Kit Management</h1>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Parameters Selection */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm h-fit">
               <h2 className="text-xl font-bold mb-6">Target kit for:</h2>
               
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">School</label>
                     <select 
                        value={selectedSchool} 
                        onChange={e => setSelectedSchool(e.target.value)}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-brand-primary"
                     >
                        {schools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                     <select 
                        value={selectedClass} 
                        onChange={e => setSelectedClass(e.target.value)}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-brand-primary"
                     >
                        {Array.from({length: 12}, (_,i) => <option key={i+1} value={String(i+1)}>Class {i+1}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                     <select 
                        value={selectedGender} 
                        onChange={e => setSelectedGender(e.target.value)}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-brand-primary"
                     >
                        <option value="Boys">Boys</option>
                        <option value="Girls">Girls</option>
                     </select>
                  </div>
               </div>
            </div>

            {/* Builder Area */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Products in Kit</h2>
                  <button 
                     onClick={handleSaveKit}
                     disabled={saving || kitItems.length === 0}
                     className="px-6 py-2 bg-brand-primary text-white rounded-xl font-bold hover:bg-brand-primary/90 disabled:opacity-50"
                  >
                     {saving ? "Saving..." : "Save Kit"}
                  </button>
               </div>

               {availableProducts.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-2xl">
                     No uniform products found for this school. Please add products first.
                  </div>
               ) : (
                  <div className="space-y-3">
                     {availableProducts.map(product => {
                        const inKit = kitItems.find(i => i.product === product._id);
                        return (
                           <div key={product._id} className={`p-4 rounded-xl border flex items-center justify-between transition-all ${inKit ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
                              <div className="flex items-center gap-4">
                                 <img src={product.images?.[0]} className="w-12 h-12 object-contain rounded bg-white" alt="" />
                                 <div>
                                    <h4 className="font-bold text-gray-900">{product.name}</h4>
                                    <p className="text-sm text-gray-500">{product.category} • ₹{product.price}</p>
                                 </div>
                              </div>
                              <button 
                                 onClick={() => toggleProductInKit(product._id)}
                                 className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${inKit ? 'bg-brand-primary text-white shadow-md' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                              >
                                 {inKit ? <CheckCircle size={20} /> : <Plus size={20} />}
                              </button>
                           </div>
                        )
                     })}
                  </div>
               )}
            </div>
         </div>
      </main>
      <Footer />
    </div>
  );
}
