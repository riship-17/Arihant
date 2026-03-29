import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface PageSpinnerProps {
  message?: string;
}

export default function PageSpinner({ message = "Loading..." }: PageSpinnerProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-brand-primary/20" />
          <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
        </div>
        <p className="text-gray-500 font-medium animate-pulse">{message}</p>
      </main>
      <Footer />
    </div>
  );
}

/** Inline spinner — use inside a card/section, not full page */
export function InlineSpinner({ message = "Loading..." }: PageSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16">
      <div className="relative w-10 h-10">
        <div className="w-10 h-10 rounded-full border-4 border-brand-primary/20" />
        <div className="absolute inset-0 rounded-full border-4 border-brand-primary border-t-transparent animate-spin" />
      </div>
      <p className="text-gray-400 text-sm animate-pulse">{message}</p>
    </div>
  );
}
