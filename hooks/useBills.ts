import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import billsService from '../services/bills.service';
import {
  Bill,
  BillFilter,
  SimplifiedBill,
  BillImpact,
  VoteRecord,
} from '../types/bills.types';

export function useBills(filter?: BillFilter) {
  return useQuery({
    queryKey: ['bills', filter],
    queryFn: () => billsService.getBills(filter),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useInfiniteBills(filter?: BillFilter) {
  return useInfiniteQuery({
    queryKey: ['bills', 'infinite', filter],
    queryFn: ({ pageParam = 1 }) => 
      billsService.getBills({ ...filter, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const nextPage = (lastPage.page || 0) + 1;
      return nextPage <= Math.ceil(lastPage.total / lastPage.pageSize) ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBill(id: string) {
  return useQuery({
    queryKey: ['bill', id],
    queryFn: () => billsService.getBillById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useBillByNumber(billNumber: string) {
  return useQuery({
    queryKey: ['bill', 'number', billNumber],
    queryFn: () => billsService.getBillByNumber(billNumber),
    enabled: !!billNumber,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSimplifiedBill(billId: string, readingLevel?: string) {
  return useQuery({
    queryKey: ['bill', billId, 'simplified', readingLevel],
    queryFn: () => billsService.getSimplifiedBill(billId, readingLevel),
    enabled: !!billId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useBillFullText(billId: string) {
  return useQuery({
    queryKey: ['bill', billId, 'fullText'],
    queryFn: () => billsService.getBillFullText(billId),
    enabled: !!billId,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useBillVotes(billId: string) {
  return useQuery({
    queryKey: ['bill', billId, 'votes'],
    queryFn: () => billsService.getBillVotes(billId),
    enabled: !!billId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBillImpact(billId: string, zipCode?: string) {
  return useQuery({
    queryKey: ['bill', billId, 'impact', zipCode],
    queryFn: () => billsService.getBillImpact(billId, zipCode),
    enabled: !!billId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useSearchBills(query: string) {
  return useQuery({
    queryKey: ['bills', 'search', query],
    queryFn: () => billsService.searchBills(query),
    enabled: !!query && query.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTrendingBills(limit: number = 10) {
  return useQuery({
    queryKey: ['bills', 'trending', limit],
    queryFn: () => billsService.getTrendingBills(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRecentBills(limit: number = 10) {
  return useQuery({
    queryKey: ['bills', 'recent', limit],
    queryFn: () => billsService.getRecentBills(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRelatedBills(billId: string) {
  return useQuery({
    queryKey: ['bill', billId, 'related'],
    queryFn: () => billsService.getRelatedBills(billId),
    enabled: !!billId,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function usePersonalizedBills(zipCode: string, interests?: string[]) {
  return useQuery({
    queryKey: ['bills', 'personalized', zipCode, interests],
    queryFn: () => billsService.getPersonalizedBills(zipCode, interests),
    enabled: !!zipCode,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useCompareBills(billIds: string[]) {
  return useQuery({
    queryKey: ['bills', 'compare', billIds],
    queryFn: () => billsService.compareBills(billIds),
    enabled: billIds.length > 1,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useBillSubscription() {
  const queryClient = useQueryClient();

  const subscribeMutation = useMutation({
    mutationFn: (billId: string) => billsService.subscribeToBill(billId),
    onSuccess: (_, billId) => {
      queryClient.invalidateQueries({ queryKey: ['bill', billId] });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: (billId: string) => billsService.unsubscribeFromBill(billId),
    onSuccess: (_, billId) => {
      queryClient.invalidateQueries({ queryKey: ['bill', billId] });
    },
  });

  return {
    subscribe: subscribeMutation.mutate,
    unsubscribe: unsubscribeMutation.mutate,
    isSubscribing: subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending,
  };
}