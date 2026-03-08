import { supabase } from './supabase';

export interface AdoptionFunnel {
  listings: number;
  views: number;
  favorites: number;
  applications: number;
  approved: number;
  completed: number;
}

export interface MonthlyAdoptions {
  month: string;
  count: number;
}

export interface SpeciesBreakdown {
  species: string;
  count: number;
}

export interface AdoptionStatsData {
  funnel: AdoptionFunnel;
  monthlyAdoptions: MonthlyAdoptions[];
  speciesBreakdown: SpeciesBreakdown[];
  avgDaysToAdopt: number;
  returnRate: number;
  totalAdoptions: number;
}

export async function fetchAdoptionStats(shelterId: string): Promise<AdoptionStatsData> {
  // Fetch all relevant data in parallel
  const [listingsRes, applicationsRes, handoffsRes, animalsRes] = await Promise.all([
    supabase.from('adoption_listings').select('id, view_count, favorite_count, application_count, listing_status, published_at').eq('shelter_id', shelterId),
    supabase.from('adoption_applications').select('id, status, submitted_at').eq('shelter_id', shelterId),
    supabase.from('adoption_handoffs').select('id, status, initiated_at, accepted_at, shelter_animal_id').eq('shelter_id', shelterId),
    supabase.from('shelter_animals').select('id, species, status, intake_date').eq('shelter_id', shelterId),
  ]);

  const listings = listingsRes.data ?? [];
  const applications = applicationsRes.data ?? [];
  const handoffs = handoffsRes.data ?? [];
  const animals = animalsRes.data ?? [];

  // Funnel
  const funnel: AdoptionFunnel = {
    listings: listings.length,
    views: listings.reduce((s, l) => s + (l.view_count || 0), 0),
    favorites: listings.reduce((s, l) => s + (l.favorite_count || 0), 0),
    applications: applications.length,
    approved: applications.filter((a) => ['approved', 'completed'].includes(a.status)).length,
    completed: handoffs.filter((h) => ['accepted', 'completed'].includes(h.status)).length,
  };

  // Monthly adoptions (last 12 months)
  const completedHandoffs = handoffs.filter((h) => ['accepted', 'completed'].includes(h.status) && h.accepted_at);
  const monthlyMap = new Map<string, number>();
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyMap.set(key, 0);
  }
  for (const h of completedHandoffs) {
    const d = new Date(h.accepted_at);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (monthlyMap.has(key)) monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
  }
  const monthlyAdoptions: MonthlyAdoptions[] = Array.from(monthlyMap.entries()).map(([month, count]) => ({ month, count }));

  // Species breakdown
  const adoptedAnimalIds = new Set(completedHandoffs.map((h) => h.shelter_animal_id));
  const speciesMap = new Map<string, number>();
  for (const a of animals) {
    if (adoptedAnimalIds.has(a.id)) {
      const sp = (a.species || 'Unknown').charAt(0).toUpperCase() + (a.species || 'unknown').slice(1);
      speciesMap.set(sp, (speciesMap.get(sp) || 0) + 1);
    }
  }
  const speciesBreakdown: SpeciesBreakdown[] = Array.from(speciesMap.entries())
    .map(([species, count]) => ({ species, count }))
    .sort((a, b) => b.count - a.count);

  // Avg days to adopt (from intake to handoff acceptance)
  let totalDays = 0;
  let daysCount = 0;
  for (const h of completedHandoffs) {
    const animal = animals.find((a) => a.id === h.shelter_animal_id);
    if (animal?.intake_date && h.accepted_at) {
      const days = Math.round(
        (new Date(h.accepted_at).getTime() - new Date(animal.intake_date).getTime()) / (1000 * 60 * 60 * 24),
      );
      if (days >= 0) {
        totalDays += days;
        daysCount++;
      }
    }
  }
  const avgDaysToAdopt = daysCount > 0 ? Math.round(totalDays / daysCount) : 0;

  // Return rate (animals returned after adoption - simplified: animals with status 'returned')
  const returnedCount = animals.filter((a) => a.status === 'returned').length;
  const totalAdoptions = completedHandoffs.length;
  const returnRate = totalAdoptions > 0 ? Math.round((returnedCount / totalAdoptions) * 100) : 0;

  return {
    funnel,
    monthlyAdoptions,
    speciesBreakdown,
    avgDaysToAdopt,
    returnRate,
    totalAdoptions,
  };
}
