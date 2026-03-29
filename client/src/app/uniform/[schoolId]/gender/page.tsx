"use client";

import { useParams, useRouter } from "next/navigation";
import { Users, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUniformStore } from "@/store/uniformStore";

export default function SelectGenderPage() {
  const router = useRouter();
  const { schoolId } = useParams();

  const setGender = useUniformStore((state) => state.setGender);

  const handleSelect = (g: string) => {
    setGender(g);
    router.push(`/uniform/${schoolId}/class`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-brand-primary transition-colors mb-8"
          >
            <ArrowLeft size={20} /> Back to Schools
          </button>

          <div className="text-center mb-12">
            <h1 className="text-4xl font-heading text-brand-secondary mb-4">Select Gender</h1>
            <p className="text-gray-600 text-lg">Choose the appropriate category to find the perfect fit.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-brand-primary/5 border border-brand-primary/10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {["Boy", "Girl"].map((g) => (
                <button
                  key={g}
                  onClick={() => handleSelect(g)}
                  className="p-10 rounded-3xl border border-gray-200 transition-all text-center group hover:border-brand-primary hover:shadow-lg hover:shadow-brand-primary/10 bg-white"
                >
                  <div className="mb-4 flex justify-center">
                    <div className="w-20 h-20 rounded-full bg-brand-primary/5 flex items-center justify-center group-hover:bg-brand-primary/10 transition-colors">
                      <Users size={40} className="text-brand-primary" />
                    </div>
                  </div>
                  <span className="font-heading text-2xl text-brand-secondary group-hover:text-brand-primary transition-colors">{g}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
