import { supabase, isSupabaseConfigured } from './supabase';
import type { BusinessReminder, ReminderType } from '../types/reminder';

export interface CreateReminderInput {
  businessId: string;
  petId: string;
  serviceLinkId: string | null;
  title: string;
  message: string;
  type: ReminderType;
  scheduledFor: string; // ISO datetime
}

export async function createReminder(input: CreateReminderInput): Promise<BusinessReminder> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('business_reminders')
    .insert({
      business_id: input.businessId,
      pet_id: input.petId,
      service_link_id: input.serviceLinkId,
      title: input.title,
      message: input.message,
      type: input.type,
      scheduled_for: input.scheduledFor,
      status: 'scheduled',
    })
    .select()
    .single();

  if (error) throw error;
  return data as BusinessReminder;
}

export async function fetchReminders(
  businessId: string,
  petId?: string,
): Promise<(BusinessReminder & { pet_name?: string })[]> {
  if (!isSupabaseConfigured) return [];

  let query = supabase
    .from('business_reminders')
    .select('*, pet:pets(name)')
    .eq('business_id', businessId)
    .order('scheduled_for', { ascending: true });

  if (petId) {
    query = query.eq('pet_id', petId);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map((r) => ({
    ...r,
    pet_name: (r.pet as unknown as { name: string })?.name ?? undefined,
  }));
}

export async function cancelReminder(reminderId: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('business_reminders')
    .update({ status: 'cancelled' })
    .eq('id', reminderId);

  if (error) throw error;
}

export async function deleteReminder(reminderId: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('business_reminders')
    .delete()
    .eq('id', reminderId);

  if (error) throw error;
}
