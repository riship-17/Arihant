"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const openWhatsApp = () => {
    window.open("https://wa.me/910000000000?text=Hello, I need help with my uniform order.", "_blank");
  };

  return (
    <button
      onClick={openWhatsApp}
      className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#25D366] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group"
      aria-label="Contact on WhatsApp"
    >
      <MessageCircle size={32} fill="currentColor" />
      <span className="absolute right-full mr-4 px-4 py-2 bg-white text-gray-800 text-sm font-medium rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-100">
        Need help? Chat with us
      </span>
    </button>
  );
}
