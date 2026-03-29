import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import WhatsAppButton from "@/components/WhatsAppButton";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Arihant Store | School Uniforms Online",
    template: "%s | Arihant Store",
  },
  description:
    "Order high-quality school uniforms online. Trusted by parents across the city. Fast delivery, easy returns.",
  keywords: ["school uniforms", "uniform online", "Arihant store", "school kit", "buy uniform"],
  openGraph: {
    title: "Arihant Store — School Uniforms Online",
    description: "Premium quality school uniforms delivered to your doorstep.",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Providers>
          {children}
          <WhatsAppButton />
        </Providers>
      </body>
    </html>
  );
}
