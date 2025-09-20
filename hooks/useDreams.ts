import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DreamService } from '@/services/dreamService';
import { Dream } from '@/types/dream';

export const useDreams = () => {
  return useQuery({
    queryKey: ['dreams'],
    queryFn: () => DreamService.getAllDreams(),
    staleTime: 0, // Always refetch when component mounts
  });
};

export const useDream = (dreamId: string) => {
  return useQuery({
    queryKey: ['dream', dreamId],
    queryFn: () => DreamService.getDreamById(dreamId),
    enabled: !!dreamId,
    staleTime: 0, // Always refetch when component mounts
  });
};

export const useDreamStats = () => {
  return useQuery({
    queryKey: ['dreamStats'],
    queryFn: () => DreamService.getDreamStats(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useSaveDream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dream: Omit<Dream, 'id' | 'createdAt' | 'updatedAt'>) =>
      DreamService.saveDream(dream),
    onSuccess: () => {
      // Invalidate and refetch dreams list and stats
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      queryClient.invalidateQueries({ queryKey: ['dreamStats'] });
    },
  });
};

export const useUpdateDream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ dreamId, updates }: { dreamId: string; updates: Partial<Dream> }) =>
      DreamService.updateDream(dreamId, updates),
    onSuccess: (_, { dreamId }) => {
      // Invalidate and refetch dreams list and specific dream
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      queryClient.invalidateQueries({ queryKey: ['dream', dreamId] });
      queryClient.invalidateQueries({ queryKey: ['dreamStats'] });
    },
  });
};

export const useDeleteDream = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dreamId: string) => DreamService.deleteDream(dreamId),
    onSuccess: () => {
      // Invalidate and refetch dreams list and stats
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      queryClient.invalidateQueries({ queryKey: ['dreamStats'] });
    },
  });
};

export const useSaveInterpretation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (interpretation: Parameters<typeof DreamService.saveInterpretation>[0]) =>
      DreamService.saveInterpretation(interpretation),
    onSuccess: (_, interpretation) => {
      // Invalidate and refetch dreams list, specific dream and stats
      queryClient.invalidateQueries({ queryKey: ['dreams'] });
      queryClient.invalidateQueries({ queryKey: ['dream', interpretation.dreamId] });
      queryClient.invalidateQueries({ queryKey: ['dreamStats'] });
    },
  });
};