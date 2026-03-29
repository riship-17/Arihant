/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, School } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import api from "@/lib/api";

import { InlineSpinner } from "@/components/PageSpinner";
import ErrorBanner from "@/components/ErrorBanner";
import { EmptySchools } from "@/components/EmptyState";

export default function SelectSchoolPage() {
  const router = useRouter();
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSchools = async () => {
    try {
      const res = await api.get("/schools");
      setSchools(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load schools");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools();
  }, []);

  const handleSelect = (schoolId: string) => {
    router.push(`/uniform/${schoolId}/gender`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary mb-6">
              <School size={32} />
            </div>
            <h1 className="text-4xl font-heading text-brand-secondary mb-4">Select Your School</h1>
            <p className="text-gray-600 text-lg">Choose your school to see the official uniform kits.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-brand-primary/5 border border-brand-primary/10">
            {loading ? (
              <div className="py-12">
                <InlineSpinner message="Finding schools..." />
              </div>
            ) : error ? (
              <ErrorBanner 
                type="server" 
                message="We couldn't load the schools list. Please try again." 
                onRetry={() => {
                  setLoading(true);
                  setError(null);
                  fetchSchools();
                }} 
              />
            ) : schools.length > 0 ? (
              <div className="space-y-4">
                {schools.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => handleSelect(s._id)}
                    className="w-full relative overflow-hidden text-left bg-white rounded-2xl border border-gray-200 hover:border-brand-primary/30 hover:shadow-lg transition-all group p-4 flex items-center justify-between"
                  >
                     <div className="flex items-center gap-6 relative z-10">
                        {s.logo ? (
                          <div className="w-16 h-16 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-2 shadow-sm">
                            <img src={s.logo} alt={s.name} className="max-w-full max-h-full object-contain" />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-brand-primary/5 rounded-xl flex items-center justify-center text-brand-primary">
                            <School size={24} />
                          </div>
                        )}
                        <div>
                          <h3 className="text-xl font-bold text-brand-secondary group-hover:text-brand-primary transition-colors">{s.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">View official uniforms</p>
                        </div>
                     </div>
                     <div className="w-10 h-10 rounded-full bg-brand-primary/5 flex items-center justify-center group-hover:bg-brand-primary group-hover:text-white transition-all text-brand-primary relative z-10">
                        <ChevronRight size={20} className="translate-x-[-2px] group-hover:translate-x-0 transition-transform" />
                     </div>

                     {/* Subtle Banner Background */}
                     {s.banner && (
                       <div className="absolute top-0 right-0 w-1/3 h-full opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                         <img src={s.banner} className="w-full h-full object-cover object-left" alt="" />
                         <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent" />
                       </div>
                     )}
                  </button>
                ))}
              </div>
            ) : (
              <EmptySchools />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
