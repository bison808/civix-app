import nextDynamic from 'next/dynamic';

export const dynamic = 'force-dynamic';

// Dynamic import with SSR disabled to prevent React Query context errors
const CommitteesPageClient = nextDynamic(
  () => import('@/components/pages/CommitteesPageClient'),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Legislative Committees...</p>
        </div>
      </div>
    )
  }
);

export default function CommitteesPage() {
  return <CommitteesPageClient />;
}