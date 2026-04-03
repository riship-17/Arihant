/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";

interface ImageAttribution {
  photographer?: string;
  photographer_url?: string;
  source?: string;
}

interface GalleryImage {
  url: string;
  public_id?: string;
  is_primary?: boolean;
  attribution?: ImageAttribution;
}

interface ProductImageGalleryProps {
  images?: GalleryImage[];
  primaryImage?: string;
  fallbackUrl?: string;
  productName?: string;
}

export default function ProductImageGallery({
  images,
  primaryImage,
  fallbackUrl,
  productName = "Uniform item"
}: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // If no gallery images, show single image or placeholder
  if (!images || images.length === 0) {
    const singleUrl = primaryImage || fallbackUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800";
    
    if (singleUrl) {
      return (
        <div className="relative aspect-[4/5] bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden rounded-2xl group">
          <img
            src={singleUrl}
            alt={productName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800";
            }}
          />
        </div>
      );
    }
    return (
      <div className="aspect-[4/5] bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl flex flex-col items-center justify-center text-gray-300">
        <ImageOff size={48} className="mb-3" />
        <span className="text-sm font-medium">Image coming soon</span>
      </div>
    );
  }

  const activeImage = images[activeIndex];

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative aspect-[4/5] bg-gradient-to-b from-gray-50 to-gray-100 overflow-hidden rounded-2xl group">
        <img
          src={activeImage.url}
          alt={`${productName} - view ${activeIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=800";
          }}
        />

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-white"
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Image counter dot indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex(idx);
                }}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === activeIndex
                    ? "bg-white w-5 shadow-md"
                    : "bg-white/50 hover:bg-white/80"
                }`}
              />
            ))}
          </div>
        )}

        {/* Unsplash attribution — required by TOS */}
        {activeImage.attribution?.photographer && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent p-3 pt-8 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-[10px] text-white/80">
              Photo by{" "}
              <a
                href={`${activeImage.attribution.photographer_url}?utm_source=arihant_store&utm_medium=referral`}
                target="_blank"
                rel="noreferrer"
                className="underline text-white/90 hover:text-white"
              >
                {activeImage.attribution.photographer}
              </a>
              {" "}on{" "}
              <a
                href="https://unsplash.com/?utm_source=arihant_store&utm_medium=referral"
                target="_blank"
                rel="noreferrer"
                className="underline text-white/90 hover:text-white"
              >
                Unsplash
              </a>
            </p>
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                index === activeIndex
                  ? "border-brand-primary shadow-md shadow-brand-primary/20 scale-105"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={`View ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
