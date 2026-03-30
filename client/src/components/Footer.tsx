export default function Footer() {
  return (
    <footer className="bg-brand-secondary text-brand-bg py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <img src="/logo.png" alt="Arihant Logo" className="h-10 w-auto brightness-0 invert" />

            </div>
            <p className="text-sm opacity-80 max-w-md ml-1">
              Your trusted partner for school uniforms for decades. Now bringing quality and convenience to your doorstep via our online store.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-heading mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li><a href="#" className="hover:text-brand-accent transition-colors">Shop Uniforms</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Sizing Guide</a></li>
              <li><a href="#" className="hover:text-brand-accent transition-colors">Shipping Policy</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-heading mb-4">Contact</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>WhatsApp: +91 00000 00000</li>
              <li>Email: contact@arihantstore.com</li>
              <li>Shop No. 123, Main Market</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-brand-bg/10 mt-12 pt-8 text-center text-xs opacity-60">
          <p>© {new Date().getFullYear()} Arihant Store. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
