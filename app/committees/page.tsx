import dynamic from 'next/dynamic';

// Single dynamic import to prevent React Query SSR issues - no loading chain
const CommitteesPageContent = dynamic(
  () => import('@/components/pages/CommitteesPageContent').then(mod => ({ default: mod.CommitteesPageContent })),
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
  return <CommitteesPageContent />;
}