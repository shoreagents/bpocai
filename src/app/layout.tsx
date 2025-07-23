import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BPOC.AI - Where BPO Careers Begin",
  description: "The ultimate AI-powered BPO recruitment platform for Filipino professionals. Build your career with FREE resume builder, skill assessments, and career games.",
  keywords: "BPO, career, resume builder, AI, Philippines, job matching, skills assessment, customer service, technical support, sales",
  authors: [{ name: "BPOC.AI Team" }],
  creator: "BPOC.AI",
  publisher: "BPOC.AI",
  openGraph: {
    title: "BPOC.AI - Where BPO Careers Begin",
    description: "Revolutionizing BPO recruitment with AI-powered tools for Filipino professionals",
    url: "https://bpoc.ai",
    siteName: "BPOC.AI",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "BPOC.AI - Where BPO Careers Begin",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BPOC.AI - Where BPO Careers Begin",
    description: "Revolutionizing BPO recruitment with AI-powered tools",
    images: ["/og-image.jpg"],
    creator: "@bpocai",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-black text-white`}>

        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
