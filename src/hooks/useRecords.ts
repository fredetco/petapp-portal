import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePortalAuth } from '../context/PortalAuthContext';
import { fetchRecords, createRecord, updateRecordVisibility, deleteRecord, type CreateRecordInput } from '../services/records';

export function useRecords(petId?: string) {
  const { business } = usePortalAuth();

  return useQuery({
    queryKey: ['records', business?.id, petId],
    queryFn: () => fetchRecords(business!.id, petId),
    enabled: !!business,
  });
}

export function useCreateRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateRecordInput) => createRecord(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['pet-detail'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useToggleRecordVisibility() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ recordId, visible }: { recordId: string; visible: boolean }) =>
      updateRecordVisibility(recordId, visible),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
    },
  });
}

export function useDeleteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (recordId: string) => deleteRecord(recordId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['records'] });
      queryClient.invalidateQueries({ queryKey: ['pet-detail'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
