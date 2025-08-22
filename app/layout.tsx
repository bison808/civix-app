import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryProvider } from '@/providers/query-provider';
import { CriticalCSS, ResourcePreloader, PerformanceMonitor } from '@/components/CriticalCSS';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import { WebVitalsMonitor } from '@/components/performance/WebVitals';
import './globals.css';

// Force dynamic rendering to avoid React Query SSR issues
export const dynamic = 'force-dynamic';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
  preload: true
});

export const metadata: Metadata = {
  title: 'CITZN - Directing Democracy',
  description: 'Citizen engagement platform for government transparency',
  keywords: 'government, transparency, citizen, engagement, bills, voting, citzn, democracy',
  authors: [{ name: 'CITZN Team' }],
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <CriticalCSS />
        <ResourcePreloader />
      </head>
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
          </AuthProvider>
        </QueryProvider>
        <ServiceWorkerRegistration />
        <PerformanceMonitor />
        <WebVitalsMonitor />
      </body>
    </html>
  );
}