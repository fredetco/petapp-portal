import { supabase, isSupabaseConfigured } from './supabase';
import type { BusinessRecord, RecordType } from '../types/businessRecord';

export interface CreateRecordInput {
  businessId: string;
  petId: string;
  serviceLinkId: string | null;
  authorUserId: string;
  type: RecordType;
  title: string;
  notes: string | null;
  date: string;
  weight: number | null;
  weightUnit: string | null;
  vaccinationName: string | null;
  vaccinationBatch: string | null;
  vaccinationNextDue: string | null;
  medications: string[];
  diagnosisText: string | null;
  treatmentText: string | null;
  visibleToOwner: boolean;
}

export async function createRecord(input: CreateRecordInput): Promise<BusinessRecord> {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');

  const { data, error } = await supabase
    .from('business_records')
    .insert({
      business_id: input.businessId,
      pet_id: input.petId,
      service_link_id: input.serviceLinkId,
      author_user_id: input.authorUserId,
      type: input.type,
      title: input.title,
      notes: input.notes,
      date: input.date,
      weight: input.weight,
      weight_unit: input.weightUnit,
      vaccination_name: input.vaccinationName,
      vaccination_batch: input.vaccinationBatch,
      vaccination_next_due: input.vaccinationNextDue,
      medications: input.medications,
      diagnosis_text: input.diagnosisText,
      treatment_text: input.treatmentText,
      visible_to_owner: input.visibleToOwner,
    })
    .select()
    .single();

  if (error) throw error;
  return data as BusinessRecord;
}

export async function fetchRecords(
  businessId: string,
  petId?: string,
): Promise<(BusinessRecord & { pet_name?: string })[]> {
  if (!isSupabaseConfigured) return [];

  let query = supabase
    .from('business_records')
    .select('*, pet:pets(name)')
    .eq('business_id', businessId)
    .order('date', { ascending: false });

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

export async function updateRecordVisibility(
  recordId: string,
  visibleToOwner: boolean,
) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('business_records')
    .update({ visible_to_owner: visibleToOwner })
    .eq('id', recordId);

  if (error) throw error;
}

export async function deleteRecord(recordId: string) {
  if (!isSupabaseConfigured) throw new Error('Supabase not configured');

  const { error } = await supabase
    .from('business_records')
    .delete()
    .eq('id', recordId);

  if (error) throw error;
}
