'use client';

import { useBills } from '@/hooks/useBills';

export default function DebugBillsPage() {
  const { data: billsData, isLoading, error } = useBills();
  
  console.log('DEBUG BILLS PAGE:', {
    billsData,
    isLoading,
    error,
    hasData: !!billsData,
    isBillsArray: Array.isArray(billsData),
    billsDataType: typeof billsData,
    billsCount: billsData ? (Array.isArray(billsData) ? billsData.length : (billsData.bills ? billsData.bills.length : 'no bills property')) : 'no data'
  });

  const bills = Array.isArray(billsData) ? billsData : (billsData?.bills || []);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Bills Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-bold">React Query State:</h2>
        <p>Loading: {isLoading ? 'YES' : 'NO'}</p>
        <p>Error: {error ? String(error) : 'none'}</p>
        <p>Has Data: {billsData ? 'YES' : 'NO'}</p>
        <p>Data Type: {typeof billsData}</p>
        <p>Is Array: {Array.isArray(billsData) ? 'YES' : 'NO'}</p>
        <p>Bills Count: {bills.length}</p>
      </div>
      
      {isLoading && (
        <div className="bg-yellow-100 p-4 rounded mb-4">
          <p>🔄 Loading bills...</p>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 p-4 rounded mb-4">
          <p>❌ Error: {String(error)}</p>
        </div>
      )}
      
      {bills.length > 0 && (
        <div className="bg-green-100 p-4 rounded mb-4">
          <h3 className="font-bold">✅ Bills Found ({bills.length})</h3>
          {bills.slice(0, 3).map((bill, i) => (
            <div key={i} className="border-b py-2">
              <p><strong>ID:</strong> {bill.id}</p>
              <p><strong>Number:</strong> {bill.billNumber}</p>
              <p><strong>Title:</strong> {bill.title}</p>
            </div>
          ))}
        </div>
      )}
      
      {!isLoading && !error && bills.length === 0 && (
        <div className="bg-orange-100 p-4 rounded mb-4">
          <p>⚠️ No bills found (but no error)</p>
          <p>Raw data: {JSON.stringify(billsData)}</p>
        </div>
      )}
      
      <div className="bg-blue-100 p-4 rounded">
        <h3 className="font-bold">Raw Response Debug:</h3>
        <pre className="text-xs overflow-x-auto">
          {JSON.stringify(billsData, null, 2)}
        </pre>
      </div>
    </div>
  );
}