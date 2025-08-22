import { Metadata } from 'next';
import type { Bill, Representative } from '@/types';

// Base SEO configuration for civic platform
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://citzn.vote';
const SITE_NAME = 'CITZN - Directing Democracy';
const DEFAULT_DESCRIPTION = 'Citizen engagement platform for government transparency. Track bills, contact representatives, and stay informed about democracy.';

export const defaultMetadata: Metadata = {
  title: {
    template: `%s | ${SITE_NAME}`,
    default: SITE_NAME,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    'democracy',
    'civic engagement', 
    'government transparency',
    'congress bills',
    'representatives',
    'voting',
    'citizen participation',
    'political awareness'
  ],
  authors: [{ name: 'CITZN Team' }],
  creator: 'CITZN',
  publisher: 'CITZN',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BASE_URL,
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'CITZN - Directing Democracy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@CITZN',
    creator: '@CITZN',
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

// Generate SEO metadata for bill pages
export function generateBillMetadata(bill: Bill): Metadata {
  const title = `${bill.billNumber}: ${bill.title}`;
  const description = `${bill.summary.slice(0, 155)}... | Status: ${bill.status.stage} | Sponsor: ${bill.sponsor.name} (${bill.sponsor.party})`;
  const url = `${BASE_URL}/bill/${bill.id}`;
  
  return {
    title,
    description,
    keywords: [
      bill.billNumber,
      bill.sponsor.name,
      bill.chamber,
      'congress bill',
      'legislation',
      ...bill.subjects.map(s => s.toLowerCase()),
    ],
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      publishedTime: bill.introducedDate,
      modifiedTime: bill.lastActionDate,
      section: 'Legislation',
      tags: bill.subjects,
      images: [
        {
          url: `/api/og/bill/${bill.id}`, // Dynamic OG image
          width: 1200,
          height: 630,
          alt: `${bill.billNumber}: ${bill.title}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`/api/og/bill/${bill.id}`],
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate SEO metadata for representative pages
export function generateRepresentativeMetadata(rep: Representative): Metadata {
  const title = `${rep.name} - ${rep.party} ${rep.chamber === 'House' ? 'Representative' : 'Senator'} from ${rep.state}`;
  const description = `Contact and learn about ${rep.name}, ${rep.party} ${rep.chamber === 'House' ? 'Representative' : 'Senator'} representing ${rep.state}${rep.district ? ` District ${rep.district}` : ''}. View voting record and sponsored bills.`;
  const url = `${BASE_URL}/representatives/${rep.id}`;
  
  return {
    title,
    description,
    keywords: [
      rep.name,
      rep.party,
      rep.state,
      rep.chamber,
      'representative',
      'senator',
      'congress member',
      'voting record',
    ],
    openGraph: {
      title,
      description,
      url,
      type: 'profile',
      images: [
        {
          url: (rep as any).photoUrl || `/api/og/representative/${rep.id}`,
          width: 1200,
          height: 630,
          alt: `${rep.name} - ${rep.party} ${rep.chamber === 'House' ? 'Representative' : 'Senator'}`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [(rep as any).photoUrl || `/api/og/representative/${rep.id}`],
    },
    alternates: {
      canonical: url,
    },
  };
}

// Generate structured data for bills (JSON-LD)
export function generateBillStructuredData(bill: Bill) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${bill.billNumber}: ${bill.title}`,
    description: bill.summary,
    author: {
      '@type': 'Person',
      name: bill.sponsor.name,
      affiliation: {
        '@type': 'Organization',
        name: `US ${bill.chamber}`,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: 'CITZN',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    datePublished: bill.introducedDate,
    dateModified: bill.lastActionDate,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/bill/${bill.id}`,
    },
    keywords: bill.subjects.join(', '),
    genre: 'Politics',
    about: {
      '@type': 'Thing',
      name: 'US Legislation',
      description: 'Congressional bills and legislative process',
    },
  };
}

// Generate structured data for representatives (JSON-LD)
export function generateRepresentativeStructuredData(rep: Representative) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: rep.name,
    jobTitle: `${rep.chamber === 'House' ? 'Representative' : 'Senator'}`,
    affiliation: {
      '@type': 'Organization',
      name: `US ${rep.chamber}`,
      address: {
        '@type': 'PostalAddress',
        addressRegion: rep.state,
        addressCountry: 'US',
      },
    },
    address: {
      '@type': 'PostalAddress',
      addressRegion: rep.state,
      addressCountry: 'US',
    },
    image: (rep as any).photoUrl,
    url: `${BASE_URL}/representatives/${rep.id}`,
    sameAs: [
      rep.contactInfo?.website,
      (rep as any).social?.twitter && `https://twitter.com/${(rep as any).social.twitter}`,
      (rep as any).social?.facebook && `https://facebook.com/${(rep as any).social.facebook}`,
    ].filter(Boolean),
    memberOf: {
      '@type': 'PoliticalParty',
      name: rep.party,
    },
  };
}

// Generate sitemap data for civic content
export function generateSitemapUrls() {
  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1,
    },
    {
      url: `${BASE_URL}/feed`,
      lastModified: new Date(),
      changeFrequency: 'hourly' as const,
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/representatives`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/bills`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
  ];
}