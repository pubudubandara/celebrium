import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s | Celebrium",
    default: "Celebrium — Digital Invitation Platform",
  },
  description:
    "Celebrium is a premium multi-category digital invitation platform. Create beautiful, animated, personalized invitations for weddings, birthdays, corporate events, and more.",
  keywords: ["digital invitations", "wedding invitation", "birthday invitation", "event platform"],
  authors: [{ name: "Celebrium" }],
  creator: "Celebrium",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "Celebrium — Digital Invitation Platform",
    description: "Premium multi-category digital invitations for every celebration.",
    siteName: "Celebrium",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head />
      <body className="min-h-full antialiased">
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--bg-card)",
              border: "1px solid var(--border-subtle)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-inter, Inter, sans-serif)",
              fontSize: "0.875rem",
              borderRadius: "0.5rem",
              boxShadow: "var(--shadow-lg)",
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}
