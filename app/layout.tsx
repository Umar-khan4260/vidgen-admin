import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VidGen AI - Admin Dashboard",
  description: "Management dashboard for VidGen AI users, credits, and model settings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-950 text-slate-100">
      <body className="h-full antialiased selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
