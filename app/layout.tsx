import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import BannerStrip from "@/components/BannerStrip";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import WhatsAppButton from "@/components/WhatsAppButton";
import PageTransition from "@/components/PageTransition";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ALSayyedah — Your Modest Identity",
  description:
    "Premium Burkha, Abaya, Niqab & Hijab. Handcrafted modest fashion delivered across India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body
        className={`${playfair.variable} ${inter.variable} bg-cream text-taupe font-sans antialiased min-h-screen flex flex-col`}
      >
        <AuthProvider>
          <ScrollProgress />
          <BannerStrip />
          <PageTransition>{children}</PageTransition>
          <BackToTop />
          <WhatsAppButton />
          <Toaster 
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#6B5B4E",
                color: "#FAF7F2",
                fontFamily: "var(--font-inter)",
                fontSize: "14px",
                padding: "12px 20px",
                borderRadius: "8px",
                boxShadow: "0 10px 30px rgba(107, 91, 78, 0.2)",
              },
              success: {
                iconTheme: {
                  primary: "#C9A96E",
                  secondary: "#FAF7F2",
                },
              },
              error: {
                style: {
                  background: "#dc2626",
                  color: "#ffffff",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

