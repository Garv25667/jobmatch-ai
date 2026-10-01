import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JobMatch AI - Smart Resume Matcher",
  description: "Find the best matching jobs for your resume using AI embeddings and vector search",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
