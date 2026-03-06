import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usePortalAuth } from '../context/PortalAuthContext';
import {
  fetchReminders,
  createReminder,
  cancelReminder,
  deleteReminder,
  type CreateReminderInput,
} from '../services/reminders';

export function useReminders(petId?: string) {
  const { business } = usePortalAuth();

  return useQuery({
    queryKey: ['reminders', business?.id, petId],
    queryFn: () => fetchReminders(business!.id, petId),
    enabled: !!business,
  });
}

export function useCreateReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReminderInput) => createReminder(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['pet-detail'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}

export function useCancelReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reminderId: string) => cancelReminder(reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
    },
  });
}

export function useDeleteReminder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reminderId: string) => deleteReminder(reminderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reminders'] });
      queryClient.invalidateQueries({ queryKey: ['pet-detail'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
    },
  });
}
