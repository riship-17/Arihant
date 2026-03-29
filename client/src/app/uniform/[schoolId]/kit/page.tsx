/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CartSummaryBar from "@/components/CartSummaryBar";
import CatalogueItemCard from "@/components/CatalogueItemCard";
import api from "@/lib/api";
import { ArrowLeft, Package, Search } from "lucide-react";
import { useUniformStore } from "@/store/uniformStore";

/* ── loading skeleton ── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="aspect-[4/5] bg-gray-200" />
      <div className="p-5 space-y-4">
        <div className="h-5 bg-gray-200 rounded w-3/4" />
        <div className="h-7 bg-gray-200 rounded w-1/3" />
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="w-10 h-10 bg-gray-200 rounded-xl" />
          ))}
        </div>
        <div className="h-10 bg-gray-200 rounded-xl w-1/2" />
        <div className="h-12 bg-gray-200 rounded-2xl" />
      </div>
    </div>
  );
}

export default function CataloguePage() {
  const router = useRouter();
  const { schoolId } = useParams();
  const gender = useUniformStore((state) => state.gender);
  const classNum = useUniformStore((state) => state.classRange);

  const [items, setItems] = useState<any[]>([]);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"regular" | "sports">("regular");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        // 1. Get school info (with populated standards)
        const schoolRes = await api.get(`/schools/${schoolId}`);
        setSchoolData(schoolRes.data);

        // 2. Map gender label → schema value
        const genderMap: Record<string, string> = { Boy: "boy", Girl: "girl" };
        const genderVal = genderMap[gender || ""] || "unisex";

        // 3. Find matching standard
        const standards = schoolRes.data.standards || [];
        const match =
          standards.find(
            (s: any) => s.className === `Grade ${classNum}` && s.gender === genderVal
          ) ||
          standards.find(
            (s: any) => s.className === `Grade ${classNum}` && s.gender === "unisex"
          );

        if (!match) {
          setError("No uniform standard found for this class/gender combination.");
          return;
        }

        // 4. Fetch uniform items for that standard
        const itemsRes = await api.get("/uniform-items", {
          params: { standard: match._id },
        });
        setItems(itemsRes.data);
      } catch (err: any) {
        console.error(err);
        setError("Could not load catalogue. Please try a different selection.");
      } finally {
        setLoading(false);
      }
    };

    if (schoolId && gender && classNum) {
      fetchItems();
    }
  }, [schoolId, gender, classNum]);

  // Filter items based on active tab
  const filteredItems = items.filter((item) => (item.uniformType || "regular") === activeTab);

  /* ── Empty state ── */
  if (!loading && (error || items.length === 0)) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="w-20 h-20 bg-brand-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-primary">
              <Package size={40} />
            </div>
            <h2 className="text-3xl font-heading text-brand-secondary mb-3">
              No Items Found
            </h2>
            <p className="text-gray-500 mb-8">
              {error || "There are no uniform items available for this selection."}
            </p>
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

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-500 hover:text-brand-primary transition-colors mb-5 text-sm"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-brand-primary/5 rounded-2xl flex items-center justify-center text-brand-primary shrink-0">
              {schoolData?.logo ? (
                <img
                  src={schoolData.logo}
                  className="w-10 h-10 object-contain"
                  alt="School Logo"
                />
              ) : (
                <Package size={32} />
              )}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-heading text-brand-secondary leading-tight">
                {schoolData?.name || "School"} Uniforms
              </h1>
              <p className="text-gray-500 mt-1">
                Class {classNum} • {gender}
                {!loading && (
                  <span className="ml-2 text-brand-primary font-semibold">
                    ({items.length} {items.length === 1 ? "item" : "items"})
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs & Main Grid ── */}
      <main className="flex-grow py-10 pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Tab Selector */}
          {!loading && items.length > 0 && (
            <div className="flex bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-8 w-fit mx-auto lg:mx-0">
              <button
                onClick={() => setActiveTab("regular")}
                className={`px-8 py-3 rounded-lg font-bold text-sm transition-all ${
                  activeTab === "regular"
                    ? "bg-brand-primary text-white shadow"
                    : "text-gray-500 hover:text-brand-secondary hover:bg-gray-50"
                }`}
              >
                Regular Uniform
              </button>
              <button
                onClick={() => setActiveTab("sports")}
                className={`px-8 py-3 rounded-lg font-bold text-sm transition-all ${
                  activeTab === "sports"
                    ? "bg-brand-primary text-white shadow"
                    : "text-gray-500 hover:text-brand-secondary hover:bg-gray-50"
                }`}
              >
                Sports Uniform
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <CatalogueItemCard key={item._id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Package size={32} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-heading text-brand-secondary mb-2">No items found</h3>
              <p className="text-gray-500">No {activeTab} uniform items are currently available for this class.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* ── Sticky Cart Summary ── */}
      <CartSummaryBar />
    </div>
  );
}
