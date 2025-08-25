import dynamic from 'next/dynamic';

// Single dynamic import to prevent React Query SSR issues - no loading chain
const BillsPageContent = dynamic(
  () => import('@/components/pages/BillsPageContent').then(mod => ({ default: mod.BillsPageContent })),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Legislative Bills...</p>
        </div>
      </div>
    )
  }
);

export default function BillsPage() {
  return <BillsPageContent />;
}