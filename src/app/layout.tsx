import type { Metadata, Viewport } from "next";
import { Montserrat, Inter, Bebas_Neue } from "next/font/google";
import "./globals.css";

// ⚠️ Next.js 16 + Turbopack: each font call must have exactly ONE weight.
// Split multi-weight fonts into separate declarations.

const montserratSemiBold = Montserrat({
  subsets: ["latin"],
  weight: "600",
  variable: "--font-montserrat",
  display: "swap",
});

const montserratBold = Montserrat({
  subsets: ["latin"],
  weight: "700",
  variable: "--font-montserrat-bold",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-inter",
  display: "swap",
});

const interMedium = Inter({
  subsets: ["latin"],
  weight: "500",
  variable: "--font-inter-medium",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#00F5D4",
};

export const metadata: Metadata = {
  title: "ALL-crm — Plataforma de Fidelización & Retención",
  description:
    "Plataforma Inteligente de Fidelización, Comisiones por Referidos y Evaluaciones para Gimnasios y Tiendas Retail.",
  manifest: "/manifest.json?v=3",
  icons: {
    icon: [
      { url: "/branding/app_icon.png?v=3", sizes: "192x192", type: "image/png" },
      { url: "/branding/app_icon.png?v=3", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico?v=3" },
    ],
    apple: [
      { url: "/branding/app_icon.png?v=3", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "ALL-crm",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${montserratSemiBold.variable} ${montserratBold.variable} ${inter.variable} ${interMedium.variable} ${bebasNeue.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-[#0B0C10] text-[#FFFFFF]">
        {children}
      </body>
    </html>
  );
}
