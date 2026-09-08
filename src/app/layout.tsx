import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BaseFace OSINT | Biometric Scan & Base Blockchain Verifier",
  description: "End-to-end pipeline: Facial Biometric Scanning, OSINT Social Media Discovery, and Tamper-Proof Attestation on Base Blockchain (L2).",
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
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#06090E] text-slate-100 antialiased selection:bg-blue-600 selection:text-white">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-950/20 via-[#06090E] to-[#06090E] pointer-events-none -z-10" />
        <div className="fixed inset-0 bg-cyber-grid bg-[size:32px_32px] opacity-15 pointer-events-none -z-10" />
        {children}
      </body>
    </html>
  );
}
