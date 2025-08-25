import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import representativesService from '../services/representatives.service';
import {
  Representative,
  RepresentativeFilter,
  Scorecard,
} from '../types/representatives.types';

export function useRepresentatives(filter?: RepresentativeFilter) {
  return useQuery({
    queryKey: ['representatives', filter],
    queryFn: () => representativesService.getRepresentatives(filter),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRepresentativesByZipCode(zipCode: string) {
  return useQuery({
    queryKey: ['representatives', 'zipCode', zipCode],
    queryFn: () => representativesService.getRepresentativesByZipCode(zipCode),
    enabled: !!zipCode,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useRepresentative(id: string) {
  return useQuery({
    queryKey: ['representative', id],
    queryFn: () => representativesService.getRepresentativeById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useRepresentativeScorecard(id: string) {
  return useQuery({
    queryKey: ['representative', id, 'scorecard'],
    queryFn: () => representativesService.getRepresentativeScorecard(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRepresentativeVotes(id: string, billId?: string) {
  return useQuery({
    queryKey: ['representative', id, 'votes', billId],
    queryFn: () => representativesService.getRepresentativeVotes(id, billId),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRepresentativeBills(id: string, type: 'sponsored' | 'cosponsored' = 'sponsored') {
  return useQuery({
    queryKey: ['representative', id, 'bills', type],
    queryFn: () => representativesService.getRepresentativeBills(id, type),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSearchRepresentatives(query: string) {
  return useQuery({
    queryKey: ['representatives', 'search', query],
    queryFn: () => representativesService.searchRepresentatives(query),
    enabled: !!query && query.length > 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRepresentativesByState(state: string) {
  return useQuery({
    queryKey: ['representatives', 'state', state],
    queryFn: () => representativesService.getRepresentativesByState(state),
    enabled: !!state,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useRepresentativesByDistrict(state: string, district: string) {
  return useQuery({
    queryKey: ['representatives', 'district', state, district],
    queryFn: () => representativesService.getRepresentativesByDistrict(state, district),
    enabled: !!state && !!district,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCompareRepresentatives(ids: string[]) {
  return useQuery({
    queryKey: ['representatives', 'compare', ids],
    queryFn: () => representativesService.compareRepresentatives(ids),
    enabled: ids.length > 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRepresentativeSubscription() {
  const queryClient = useQueryClient();

  const subscribeMutation = useMutation({
    mutationFn: (id: string) => representativesService.subscribeToRepresentative(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['representative', id] });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: (id: string) => representativesService.unsubscribeFromRepresentative(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['representative', id] });
    },
  });

  return {
    subscribe: subscribeMutation.mutate,
    unsubscribe: unsubscribeMutation.mutate,
    isSubscribing: subscribeMutation.isPending,
    isUnsubscribing: unsubscribeMutation.isPending,
  };
}