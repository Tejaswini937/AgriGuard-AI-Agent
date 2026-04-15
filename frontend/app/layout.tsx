import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgriGuard AI — Smart Crop Disease Detection",
  description: "AI-powered plant disease detection and treatment planning for Indian farmers",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ height: "100%" }}>
      <body style={{ height: "100%", overflow: "hidden" }}>
        {children}
      </body>
    </html>
  );
}
