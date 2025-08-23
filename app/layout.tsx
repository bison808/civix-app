import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
// import { ClientQueryProvider } from '@/providers/client-query-provider';
import { WebVitalsMonitor } from '@/components/performance/WebVitals';
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration';
import MobileNav from '@/components/navigation/MobileNav';
import { defaultMetadata } from '@/lib/seo';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  variable: '--font-inter'
});

export const metadata: Metadata = defaultMetadata;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  userScalable: true,
  themeColor: '#007bff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="preload" href="/citzn-logo.jpeg" as="image" type="image/jpeg" />
        <link rel="dns-prefetch" href="//api.congress.gov" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "CITZN - Directing Democracy",
              "description": "Citizen engagement platform for government transparency",
              "url": "https://citzn.vote",
              "applicationCategory": "GovernmentApplication"
            })
          }}
        />
      </head>
      <body className={inter.className}>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}

        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-blue-600 text-white px-4 py-2 rounded z-50"
        >
          Skip to main content
        </a>

        <AuthProvider>
          <MobileNav />
          <div className="min-h-screen flex flex-col">
            <main id="main-content" className="flex-1">
              {children}
            </main>
          </div>
        </AuthProvider>

        <WebVitalsMonitor />
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}