/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";
import { Plus, CheckCircle, Package } from "lucide-react";

export default function AdminKitsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [uniformItems, setUniformItems] = useState<any[]>([]);
  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedClass, setSelectedClass] = useState("1");
  const [selectedGender, setSelectedGender] = useState("boy");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schoolsRes = await api.get("/schools");
        setSchools(schoolsRes.data);
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
    const fetchItems = async () => {
      if (!selectedSchool) return;
      try {
        // Find matching standard
        const schoolRes = await api.get(`/schools/${selectedSchool}`);
        const standards = schoolRes.data.standards || [];
        const matchingStandard = standards.find((s: any) => 
          s.className === `Grade ${selectedClass}` && s.gender === selectedGender
        ) || standards.find((s: any) => 
          s.className === `Grade ${selectedClass}` && s.gender === 'unisex'
        );

        if (matchingStandard) {
          const itemsRes = await api.get("/uniform-items", {
            params: { standard: matchingStandard._id }
          });
          setUniformItems(itemsRes.data);
        } else {
          setUniformItems([]);
        }
      } catch (err) {
        console.error("Error fetching items:", err);
        setUniformItems([]);
      }
    };
    fetchItems();
  }, [selectedSchool, selectedClass, selectedGender]);

  if (loading) return <div className="p-10 text-center">Loading Admin...</div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-12 px-4 max-w-7xl mx-auto w-full">
         <div className="flex items-center gap-3 mb-8">
            <Package size={32} className="text-brand-primary" />
            <h1 className="text-3xl font-heading text-brand-secondary">Uniform Items by Standard</h1>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Parameters Selection */}
            <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm h-fit">
               <h2 className="text-xl font-bold mb-6">Filter by:</h2>
               
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
                        {Array.from({length: 12}, (_,i) => <option key={i+1} value={String(i+1)}>Grade {i+1}</option>)}
                     </select>
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                     <select 
                        value={selectedGender} 
                        onChange={e => setSelectedGender(e.target.value)}
                        className="w-full p-3 bg-gray-50 rounded-xl border border-gray-200 outline-none focus:border-brand-primary"
                     >
                        <option value="boy">Boy</option>
                        <option value="girl">Girl</option>
                        <option value="unisex">Unisex</option>
                     </select>
                  </div>
               </div>
            </div>

            {/* Items Display */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Uniform Items ({uniformItems.length})</h2>
               </div>

               {uniformItems.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-2xl">
                     No uniform items found for this selection.
                  </div>
               ) : (
                  <div className="space-y-3">
                     {uniformItems.map(item => (
                        <div key={item._id} className="p-4 rounded-xl border border-brand-primary bg-brand-primary/5 flex items-center justify-between transition-all">
                           <div className="flex items-center gap-4">
                              <img src={item.imageUrl} className="w-12 h-12 object-contain rounded bg-white" alt="" />
                              <div>
                                 <h4 className="font-bold text-gray-900">{item.itemName}</h4>
                                 <p className="text-sm text-gray-500">{item.itemType} • ₹{item.price}</p>
                              </div>
                           </div>
                           <div className="w-10 h-10 rounded-full flex items-center justify-center bg-brand-primary text-white shadow-md">
                              <CheckCircle size={20} />
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </main>
      <Footer />
    </div>
  );
}
