/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronRight, School, GraduationCap, Users, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

export default function SchoolSelector() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [schools, setSchools] = useState<any[]>([]);
  const [selection, setSelection] = useState({
    school: "",
    class: "",
    gender: "",
  });

  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const res = await api.get("/schools");
        setSchools(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSchools();
  }, []);

  const handleSelect = (key: string, value: string) => {
    setSelection({ ...selection, [key]: value });
    if (step < 3) setStep(step + 1);
  };

  const finishSelection = () => {
    router.push(`/products?school=${selection.school}&class=${selection.class}&gender=${selection.gender}`);
  };

  const steps = [
    { title: "Select School", icon: School },
    { title: "Select Class", icon: GraduationCap },
    { title: "Select Gender", icon: Users },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-3xl p-8 shadow-xl shadow-brand-primary/5 border border-brand-primary/10">
      {/* Progress Bar */}
      <div className="flex justify-between mb-12 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-brand-primary/10 -translate-y-1/2" />
        {steps.map((s, i) => (
          <div key={i} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step > i + 1 ? 'bg-brand-primary text-white' : step === i + 1 ? 'bg-brand-primary text-white scale-110' : 'bg-brand-bg text-brand-secondary border border-brand-primary/20'}`}>
              {step > i + 1 ? <Check size={18} /> : <s.icon size={18} />}
            </div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${step === i + 1 ? 'text-brand-primary' : 'text-gray-400'}`}>{s.title}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-heading text-brand-secondary mb-6 text-center">Which school do you belong to?</h2>
              <div className="grid grid-cols-1 gap-3">
                {schools.length > 0 ? schools.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => handleSelect("school", s._id)}
                    className="w-full p-5 text-left bg-brand-bg/30 rounded-2xl border border-brand-primary/5 hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-4">
                      {s.logo && (
                        <div className="w-12 h-12 bg-white rounded-xl border border-gray-100 flex items-center justify-center p-2">
                          <img src={s.logo} alt={s.name} className="max-w-full max-h-full object-contain" />
                        </div>
                      )}
                      <span className="font-medium text-brand-secondary">{s.name}</span>
                    </div>
                    <ChevronRight size={18} className="text-brand-primary opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                  </button>
                )) : (
                  <div className="text-center py-10 text-gray-400">Loading schools...</div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-heading text-brand-secondary mb-6 text-center">Choose your class</h2>
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).map((c) => (
                  <button
                    key={c}
                    onClick={() => handleSelect("class", c)}
                    className="p-4 bg-brand-bg/30 rounded-2xl border border-brand-primary/5 hover:border-brand-primary/30 hover:bg-brand-primary/5 transition-all text-center font-medium text-brand-secondary"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-heading text-brand-secondary mb-6 text-center">Final step: Gender</h2>
              <div className="grid grid-cols-2 gap-4">
                {["Boy", "Girl"].map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                        setSelection({ ...selection, gender: g });
                    }}
                    className={`p-10 rounded-3xl border transition-all text-center group ${selection.gender === g ? 'bg-brand-primary text-white border-brand-primary shadow-lg shadow-brand-primary/20' : 'bg-brand-bg/30 border-brand-primary/5 hover:border-brand-primary/30 text-brand-secondary'}`}
                  >
                    <div className="mb-2 flex justify-center">
                        <Users size={40} className={selection.gender === g ? 'text-white' : 'text-brand-primary'} />
                    </div>
                    <span className="font-heading text-lg">{g}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={finishSelection}
                disabled={!selection.gender}
                className="w-full mt-10 py-5 bg-brand-primary text-white rounded-2xl font-semibold disabled:opacity-50 shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-2"
              >
                Show Uniforms <ArrowRight size={20} />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {step > 1 && (
        <button 
          onClick={() => setStep(step - 1)}
          className="mt-8 text-sm font-medium text-brand-primary hover:underline"
        >
          ← Back
        </button>
      )}
    </div>
  );
}
