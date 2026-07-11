import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevsAura — Build Your Digital Future",
  description:
    "Premium web development, SaaS, and e-commerce solutions. Get in touch and we'll respond within 24 hours.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
