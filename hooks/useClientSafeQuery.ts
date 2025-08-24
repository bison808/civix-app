import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

// A wrapper around useQuery that ensures it only runs on the client side
export function useClientSafeQuery<
  TQueryFnData = unknown,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends readonly unknown[] = readonly unknown[]
>(
  options: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>
): UseQueryResult<TData, TError> {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return useQuery({
    ...options,
    enabled: isClient && (options.enabled !== false), // Combine with existing enabled condition
  });
}