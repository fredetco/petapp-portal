import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { usePortalAuth } from '../context/PortalAuthContext';
import type { ServiceLinkWithDetails, ServiceLinkStatus } from '../types/serviceLink';

export interface LinkedPetRow {
  id: string;           // service_link id
  petId: string;
  petName: string;
  species: string;
  breed: string | null;
  photoUrl: string | null;
  ownerName: string | null;
  status: ServiceLinkStatus;
  linkedAt: string | null;
  createdAt: string;
  notes: string | null;
}

async function fetchLinkedPets(businessId: string): Promise<LinkedPetRow[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('service_links')
    .select(`
      id,
      status,
      linked_at,
      created_at,
      notes,
      pet:pets(id, name, species, breed, photo_url, owner:profiles(full_name))
    `)
    .eq('business_id', businessId)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map((row) => {
    const pet = row.pet as unknown as {
      id: string;
      name: string;
      species: string;
      breed: string | null;
      photo_url: string | null;
      owner: { full_name: string } | null;
    } | null;

    return {
      id: row.id,
      petId: pet?.id ?? '',
      petName: pet?.name ?? 'Unknown',
      species: pet?.species ?? '',
      breed: pet?.breed ?? null,
      photoUrl: pet?.photo_url ?? null,
      ownerName: pet?.owner?.full_name ?? null,
      status: row.status,
      linkedAt: row.linked_at,
      createdAt: row.created_at,
      notes: row.notes,
    };
  });
}

async function fetchPetDetail(businessId: string, petId: string) {
  if (!isSupabaseConfigured) return null;

  // Get the service link + pet info
  const { data: link, error } = await supabase
    .from('service_links')
    .select(`
      id,
      status,
      linked_at,
      created_at,
      notes,
      service_category,
      pet:pets(id, name, species, breed, photo_url, date_of_birth, weight_kg, owner_id, owner:profiles(full_name, avatar_url))
    `)
    .eq('business_id', businessId)
    .eq('pet_id', petId)
    .in('status', ['pending', 'active'])
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !link) return null;

  const pet = link.pet as unknown as {
    id: string;
    name: string;
    species: string;
    breed: string | null;
    photo_url: string | null;
    date_of_birth: string | null;
    weight_kg: number | null;
    owner_id: string;
    owner: { full_name: string; avatar_url: string | null } | null;
  };

  // Get records count
  const { count: recordsCount } = await supabase
    .from('business_records')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('pet_id', petId);

  // Get reminders count
  const { count: remindersCount } = await supabase
    .from('business_reminders')
    .select('id', { count: 'exact', head: true })
    .eq('business_id', businessId)
    .eq('pet_id', petId);

  return {
    linkId: link.id,
    linkStatus: link.status as ServiceLinkStatus,
    linkedAt: link.linked_at,
    serviceCategory: link.service_category,
    pet: {
      id: pet.id,
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      photoUrl: pet.photo_url,
      dateOfBirth: pet.date_of_birth,
      weightKg: pet.weight_kg,
      ownerId: pet.owner_id,
      ownerName: pet.owner?.full_name ?? null,
      ownerAvatar: pet.owner?.avatar_url ?? null,
    },
    recordsCount: recordsCount ?? 0,
    remindersCount: remindersCount ?? 0,
  };
}

export function useLinkedPets() {
  const { business } = usePortalAuth();

  return useQuery({
    queryKey: ['linked-pets', business?.id],
    queryFn: () => fetchLinkedPets(business!.id),
    enabled: !!business,
  });
}

export function usePetDetail(petId: string) {
  const { business } = usePortalAuth();

  return useQuery({
    queryKey: ['pet-detail', business?.id, petId],
    queryFn: () => fetchPetDetail(business!.id, petId),
    enabled: !!business && !!petId,
  });
}

export type { ServiceLinkWithDetails };
