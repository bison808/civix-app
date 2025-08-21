import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import feedbackService from '../services/feedback.service';
import {
  Feedback,
  FeedbackSubmission,
  FeedbackFilter,
  FeedbackAggregation,
  FeedbackStats,
} from '../types/feedback.types';

export function useFeedback(filter?: FeedbackFilter) {
  return useQuery({
    queryKey: ['feedback', filter],
    queryFn: () => feedbackService.getFeedback(filter),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useInfiniteFeedback(filter?: FeedbackFilter) {
  return useInfiniteQuery({
    queryKey: ['feedback', 'infinite', filter],
    queryFn: ({ pageParam = 1 }) => 
      feedbackService.getFeedback({ ...filter, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const nextPage = (lastPage.page || 0) + 1;
      return nextPage <= Math.ceil(lastPage.total / lastPage.pageSize) ? nextPage : undefined;
    },
    initialPageParam: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useFeedbackById(id: string) {
  return useQuery({
    queryKey: ['feedback', id],
    queryFn: () => feedbackService.getFeedbackById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: FeedbackSubmission) => feedbackService.submitFeedback(data),
    onSuccess: (newFeedback) => {
      // Invalidate and refetch feedback lists
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
      
      // Optimistically add the new feedback to relevant queries
      if (newFeedback.billId) {
        queryClient.invalidateQueries({ queryKey: ['bills', newFeedback.billId, 'feedback'] });
      }
      if (newFeedback.representativeId) {
        queryClient.invalidateQueries({ queryKey: ['representatives', newFeedback.representativeId, 'feedback'] });
      }
    },
  });
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Feedback> }) =>
      feedbackService.updateFeedback(id, data),
    onSuccess: (updatedFeedback) => {
      // Update the specific feedback item
      queryClient.setQueryData(['feedback', updatedFeedback.id], updatedFeedback);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => feedbackService.deleteFeedback(id),
    onSuccess: (_, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: ['feedback', id] });
      queryClient.invalidateQueries({ queryKey: ['feedback'] });
    },
  });
}

export function useVoteFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, voteType }: { id: string; voteType: 'up' | 'down' }) =>
      feedbackService.voteFeedback(id, voteType),
    onMutate: async ({ id, voteType }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['feedback', id] });

      // Snapshot previous value
      const previousFeedback = queryClient.getQueryData(['feedback', id]);

      // Optimistically update
      queryClient.setQueryData(['feedback', id], (old: Feedback | undefined) => {
        if (!old) return old;
        
        const newVotes = [...(old.votes || [])];
        const existingVoteIndex = newVotes.findIndex(v => v.userId === 'current-user'); // You'd get this from auth context
        
        if (existingVoteIndex >= 0) {
          newVotes[existingVoteIndex] = {
            ...newVotes[existingVoteIndex],
            voteType,
            createdAt: new Date().toISOString(),
          };
        } else {
          newVotes.push({
            userId: 'current-user',
            voteType,
            createdAt: new Date().toISOString(),
          });
        }
        
        return { ...old, votes: newVotes };
      });

      return { previousFeedback };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousFeedback) {
        queryClient.setQueryData(['feedback', variables.id], context.previousFeedback);
      }
    },
    onSettled: (_, __, { id }) => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['feedback', id] });
    },
  });
}

export function useFeedbackAggregation(params: {
  topic?: string;
  billId?: string;
  representativeId?: string;
  period?: { start: string; end: string };
}) {
  return useQuery({
    queryKey: ['feedback', 'aggregation', params],
    queryFn: () => feedbackService.getFeedbackAggregation(params),
    enabled: !!(params.topic || params.billId || params.representativeId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useFeedbackStats(params?: {
  billId?: string;
  representativeId?: string;
  period?: { start: string; end: string };
}) {
  return useQuery({
    queryKey: ['feedback', 'stats', params],
    queryFn: () => feedbackService.getFeedbackStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUserFeedback(userId: string) {
  return useQuery({
    queryKey: ['users', userId, 'feedback'],
    queryFn: () => feedbackService.getUserFeedback(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useBillFeedback(billId: string) {
  return useQuery({
    queryKey: ['bills', billId, 'feedback'],
    queryFn: () => feedbackService.getBillFeedback(billId),
    enabled: !!billId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useRepresentativeFeedback(representativeId: string) {
  return useQuery({
    queryKey: ['representatives', representativeId, 'feedback'],
    queryFn: () => feedbackService.getRepresentativeFeedback(representativeId),
    enabled: !!representativeId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useTrendingFeedback(limit: number = 10) {
  return useQuery({
    queryKey: ['feedback', 'trending', limit],
    queryFn: () => feedbackService.getTrendingFeedback(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRecentFeedback(limit: number = 10) {
  return useQuery({
    queryKey: ['feedback', 'recent', limit],
    queryFn: () => feedbackService.getRecentFeedback(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useReportFeedback() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      feedbackService.reportFeedback(id, reason),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['feedback', id] });
    },
  });
}

export function useSentimentAnalysis() {
  return useMutation({
    mutationFn: (text: string) => feedbackService.analyzeSentiment(text),
  });
}

export function useSuggestTags() {
  return useMutation({
    mutationFn: (content: string) => feedbackService.suggestTags(content),
  });
}