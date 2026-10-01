import type { Metadata } from 'next';
import './globals.css';
import Navbar from '../components/Navbar';

export const metadata: Metadata = {
  title: 'JobMatch AI - Smart Resume Matcher',
  description: 'Match your resume to the top tech jobs with vector embeddings and Gemini AI reasoning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
          <p>© {new Date().getFullYear()} JobMatch AI • Powered by Pinecone Vector DB & Gemini LLM</p>
        </footer>
      </body>
    </html>
  );
}
