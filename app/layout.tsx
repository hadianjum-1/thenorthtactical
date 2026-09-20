import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/Toast";
import { CartProvider } from "@/components/cart/CartContext";
import { CartDrawer } from "@/components/cart/CartDrawer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "The North Tactical — Mission-Ready Equipment & Apparel",
    template: "%s | The North Tactical",
  },
  description:
    "Engineered for demanding missions. High-performance tactical gear, plate carriers, EDC equipment, backpacks, and rugged outdoor apparel.",
  openGraph: {
    title: "The North Tactical — Mission-Ready Equipment",
    description:
      "Engineered for demanding missions. High-performance tactical gear, backpacks, and rugged outdoor apparel.",
    type: "website",
    siteName: "The North Tactical",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#0A0A0A] text-[#F5F5F5] selection:bg-[#D6FF3F] selection:text-[#0A0A0A]">
        <ToastProvider>
          <CartProvider>
            {children}
            <CartDrawer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
