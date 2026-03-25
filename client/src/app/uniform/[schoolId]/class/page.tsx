"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, ArrowLeft, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUniformStore } from "@/store/uniformStore";

export default function SelectClassPage() {
  const router = useRouter();
  const { schoolId } = useParams();
  const setClassRange = useUniformStore((state) => state.setClassRange);

  // Mocking available classes for now - in a real app, this would be fetched based on schoolId
  const availableClasses = Array.from({ length: 12 }, (_, i) => `${i + 1}`);

  const handleSelect = (classNum: string) => {
    setClassRange(classNum);
    router.push(`/uniform/${schoolId}/kit`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-brand-primary transition-colors mb-8"
          >
            <ArrowLeft size={20} /> Back to Gender
          </button>

          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-primary/10 text-brand-primary mb-6">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-4xl font-heading text-brand-secondary mb-4">Select Class</h1>
            <p className="text-gray-600 text-lg">Choose the class to see the required uniform checklist.</p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-brand-primary/5 border border-brand-primary/10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableClasses.map((c) => (
                <button
                  key={c}
                  onClick={() => handleSelect(c)}
                  className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-brand-primary/30 hover:shadow-md hover:bg-white transition-all text-center group flex items-center justify-between"
                >
                  <span className="font-heading text-xl text-brand-secondary group-hover:text-brand-primary transition-colors">Class {c}</span>
                  <ArrowRight size={18} className="text-brand-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
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
