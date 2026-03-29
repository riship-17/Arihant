import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowRight, ShieldCheck, Truck, Clock } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-7xl font-heading text-brand-secondary leading-tight mb-8">
                Order School Uniforms <span className="text-brand-primary">Online Easily</span>
              </h1>
              <p className="text-xl text-gray-600 mb-12 leading-relaxed">
                Skip the queues and shop from the comfort of your home. Premium quality uniforms for all leading schools, delivered to your doorstep.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link 
                  href="/uniform/select-school" 
                  className="w-full sm:w-auto px-12 py-5 bg-brand-primary text-white rounded-2xl font-bold shadow-xl shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all flex items-center justify-center gap-3 text-lg group"
                >
                  Find Your School Uniform Kit <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
          
          {/* Background decorative elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-brand-primary/5 rounded-full blur-[120px] opacity-60 pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[100px] opacity-60 pointer-events-none" />
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white border-y border-brand-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
              <div className="flex flex-col items-center text-center p-6 hover:translate-y-[-4px] transition-transform duration-300">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-6">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-heading mb-3">Quality Assured</h3>
                <p className="text-gray-500 leading-relaxed text-sm">Premium fabrics that last throughout the session.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 hover:translate-y-[-4px] transition-transform duration-300">
                <div className="w-16 h-16 bg-brand-secondary/10 rounded-2xl flex items-center justify-center text-brand-secondary mb-6">
                  <Truck size={32} />
                </div>
                <h3 className="text-xl font-heading mb-3">Fast Delivery</h3>
                <p className="text-gray-500 leading-relaxed text-sm">Quick shipping across the city and beyond.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 hover:translate-y-[-4px] transition-transform duration-300">
                <div className="w-16 h-16 bg-brand-accent/10 rounded-2xl flex items-center justify-center text-brand-accent mb-6">
                  <Clock size={32} />
                </div>
                <h3 className="text-xl font-heading mb-3">Easy Returns</h3>
                <p className="text-gray-500 leading-relaxed text-sm">Hassle-free 7-day return and exchange policy.</p>
              </div>
              <div className="flex flex-col items-center text-center p-6 hover:translate-y-[-4px] transition-transform duration-300">
                <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary mb-6">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-heading mb-3">Secure Payment</h3>
                <p className="text-gray-500 leading-relaxed text-sm">100% secure payments via UPI and Cards.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Schools Section Preview */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div className="max-w-xl text-left">
                <h2 className="text-4xl font-heading text-brand-secondary mb-4">Schools We Serve</h2>
                <p className="text-gray-600">We provide official uniforms for the most prestigious schools in the region.</p>
              </div>
              <Link href="/uniform/select-school" className="text-brand-primary font-semibold flex items-center gap-2 group">
                View all schools <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-white rounded-2xl border border-brand-primary/5 flex items-center justify-center p-8 hover:border-brand-primary/20 hover:shadow-lg hover:shadow-brand-primary/5 transition-all">
                   <div className="w-full aspect-square bg-gray-100 rounded-lg animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
