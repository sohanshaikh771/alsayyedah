import type { Metadata, Viewport } from "next";
import { Italiana, Amiri, Playfair_Display, Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import BannerStrip from "@/components/BannerStrip";
import ScrollProgress from "@/components/ScrollProgress";
import BackToTop from "@/components/BackToTop";
import WhatsAppButton from "@/components/WhatsAppButton";
import PageTransition from "@/components/PageTransition";
import { Toaster } from "react-hot-toast";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const italiana = Italiana({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-italiana",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#6B5B4E",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://alsayyedah.us.ci"),
  title: {
    default: "ALSayyedah — Your Modest Identity | Premium Abaya, Burkha, Niqab & Hijab",
    template: "%s | ALSayyedah",
  },
  description: "Discover premium modest fashion at ALSayyedah. Handcrafted Abaya, Burkha, Niqab, and Hijab made with love. Pan-India delivery, COD available.",
  keywords: ["abaya", "burkha", "niqab", "hijab", "modest fashion", "islamic clothing", "ALSayyedah", "modest wear", "burqa", "muslim fashion"],
  authors: [{ name: "ALSayyedah" }],
  creator: "ALSayyedah",
  publisher: "ALSayyedah",
  
  // Open Graph (WhatsApp, Facebook, LinkedIn)
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://alsayyedah.us.ci",
    siteName: "ALSayyedah",
    title: "ALSayyedah — Your Modest Identity",
    description: "Premium Abaya, Burkha, Niqab & Hijab. Handcrafted modest fashion delivered across India.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ALSayyedah — Your Modest Identity",
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: "summary_large_image",
    title: "ALSayyedah — Your Modest Identity",
    description: "Premium Abaya, Burkha, Niqab & Hijab. Handcrafted modest fashion.",
    images: ["/og-image.jpg"],
  },
  
  // Icons
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  
  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },

  verification: {
    google: "S9RED_Y3Ct1Qzkv3gyzjvoDKdk1CJM1iELf_D8NZzh4",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${italiana.variable} ${amiri.variable} ${playfair.variable} ${inter.variable}`}>
      <body
        className={`${italiana.variable} ${amiri.variable} ${playfair.variable} ${inter.variable} bg-cream text-taupe font-sans antialiased min-h-screen flex flex-col`}
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
        <GoogleAnalytics gaId="G-8SJQE5WSCF" />
      </body>
    </html>
  );
}

