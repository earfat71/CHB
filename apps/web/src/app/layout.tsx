import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/components/AuthProvider';

export const metadata: Metadata = {
  title: "CoxBeach — Cox's Bazar Hotel Booking",
  description: "Find and book the best hotels in Cox's Bazar. Best prices, easy booking, transparent pricing.",
  keywords: "Cox's Bazar, hotel, booking, Bangladesh, sea view, beach resort",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
