import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import { Nunito_Sans, Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });
const nunitoSans = Nunito_Sans({ subsets: ["latin"], variable: "--font-nunito-sans" });

export const metadata: Metadata = {
  title: "Agri-Gator — Farming, Aggregated",
  description:
    "Agri-Gator brings weather, market prices, dosage guidance and learning into one app for Indonesian farmers.",
  icons: {
    icon: [{ url: "/logo.svg", type: "image/svg+xml" }],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`light bg-background ${sora.variable} ${nunitoSans.variable}`}>
      <body className="font-sans antialiased">
        {children}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  );
}
