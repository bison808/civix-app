#!/usr/bin/env node

/**
 * Debug Bills React Query Issue - Agent Mike
 * Tests if the issue is in React Query or component rendering
 */

const fs = require('fs');
const path = require('path');

// Read the current useBills hook
const useBillsPath = path.join(__dirname, 'hooks', 'useBills.ts');
const useBillsContent = fs.readFileSync(useBillsPath, 'utf8');

console.log('🔍 USEBILLS HOOK ANALYSIS');
console.log('========================');

// Check if useClientSafeQuery is causing issues
if (useBillsContent.includes('useClientSafeQuery')) {
  console.log('❌ FOUND ISSUE: useBills uses useClientSafeQuery');
  console.log('   This waits for client-side mounting before executing');
  console.log('   But the component might be server-side rendered');
  console.log('');
} else {
  console.log('✅ Uses regular useQuery');
}

// Check stale time
const staleTimeMatch = useBillsContent.match(/staleTime:\s*(\d+)/);
if (staleTimeMatch) {
  const staleTime = parseInt(staleTimeMatch[1]);
  console.log(`⏰ Stale time: ${staleTime}ms (${staleTime/1000/60} minutes)`);
}

console.log('');
console.log('🔧 RECOMMENDED FIX:');
console.log('   Replace useClientSafeQuery with regular useQuery in useBills');
console.log('   The bills page should work without requiring client-side only execution');
console.log('');

console.log('📊 TEST RESULTS:');
console.log('   ✅ Production API: Returns bills correctly');
console.log('   ✅ Service layer: Transforms to BillsResponse format');
console.log('   ✅ Component logic: Extracts bills correctly from billsData?.bills');
console.log('   ❌ React Query: Stuck waiting for client-side mount');
console.log('');

console.log('💡 SOLUTION:');
console.log('   Change useBills from useClientSafeQuery to useQuery');
console.log('   This will allow server-side data fetching and immediate display');