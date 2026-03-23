"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import type { Observation, ObservationStatus, ObservationPhoto, Flag, FlagReason, Profile } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface Filters {
  status: ObservationStatus | "all";
  species: string;
}

interface ObservationsState {
  observations: Observation[];
  loading: boolean;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  filteredObservations: Observation[];
  addObservation: (obs: Observation) => void;
  getById: (id: string) => Observation | undefined;
  flags: Flag[];
  flagObservation: (observationId: string, flaggerId: string, reason: FlagReason, details?: string) => void;
  getFlagsForObservation: (observationId: string) => Flag[];
  hasUserFlagged: (observationId: string, userId: string) => boolean;
  refresh: () => void;
}

const ObservationsContext = createContext<ObservationsState>(
  {} as ObservationsState
);

// Map a Supabase row to our Observation type
function mapRow(row: Record<string, unknown>): Observation {
  const photos = (row.observation_photos as Record<string, unknown>[] | null) ?? [];
  const observer = row.observer as Record<string, unknown> | null;

  return {
    id: row.id as string,
    observer_id: row.observer_id as string,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    location: { lat: row.latitude as number, lng: row.longitude as number },
    observed_at: row.observed_at as string,
    cap_shape: row.cap_shape as string | null,
    cap_color: row.cap_color as string | null,
    cap_size_cm: row.cap_size_cm as number | null,
    cap_surface: row.cap_surface as string | null,
    cap_margin: row.cap_margin as string | null,
    underside_type: row.underside_type as Observation["underside_type"],
    underside_color: row.underside_color as string | null,
    underside_spacing: row.underside_spacing as string | null,
    gill_attachment: row.gill_attachment as string | null,
    stem_color: row.stem_color as string | null,
    stem_height_cm: row.stem_height_cm as number | null,
    stem_hollow: row.stem_hollow as boolean | null,
    stem_ring: row.stem_ring as boolean | null,
    stem_shape: row.stem_shape as string | null,
    stem_surface: row.stem_surface as string | null,
    stem_base: row.stem_base as string | null,
    has_volva: row.has_volva as boolean | null,
    flesh_color: row.flesh_color as string | null,
    bruise_color: row.bruise_color as string | null,
    flesh_consistency: row.flesh_consistency as string | null,
    color_change: row.color_change as string | null,
    has_latex: row.has_latex as boolean | null,
    latex_color: row.latex_color as string | null,
    smell: row.smell as string | null,
    taste: row.taste as string | null,
    substrate: row.substrate as string | null,
    habitat: row.habitat as string | null,
    growth_pattern: row.growth_pattern as Observation["growth_pattern"],
    ecological_role: row.ecological_role as string | null,
    associated_trees: row.associated_trees as string | null,
    season: row.season as string | null,
    spore_print_color: row.spore_print_color as string | null,
    proposed_species: row.proposed_species as string | null,
    confidence: row.confidence as Observation["confidence"],
    notes: row.notes as string | null,
    status: row.status as ObservationStatus,
    verified_species: row.verified_species as string | null,
    ipfs_metadata_cid: row.ipfs_metadata_cid as string | null,
    ipfs_photo_cids: row.ipfs_photo_cids as string[] | undefined,
    nft_asset_code: row.nft_asset_code as string | null,
    nft_tx_hash: row.nft_tx_hash as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    photos: photos.map((p): ObservationPhoto => ({
      id: p.id as string,
      observation_id: p.observation_id as string,
      storage_path: p.storage_path as string,
      photo_type: p.photo_type as ObservationPhoto["photo_type"],
      sort_order: p.sort_order as number,
      created_at: p.created_at as string,
    })),
    observer: observer ? {
      id: observer.id as string,
      stellar_address: observer.stellar_address as string,
      username: observer.username as string | null,
      avatar_url: observer.avatar_url as string | null,
      created_at: observer.created_at as string,
    } as Profile : undefined,
  };
}

export function ObservationsProvider({ children }: { children: ReactNode }) {
  const supabase = createClient();

  const [observations, setObservations] = useState<Observation[]>([]);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    species: "",
  });

  const fetchObservations = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("observations")
      .select(`
        *,
        observer:profiles!observer_id(*),
        observation_photos(*)
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setObservations(data.map((row) => mapRow(row as Record<string, unknown>)));
    }
    setLoading(false);
  }, []);

  const fetchFlags = useCallback(async () => {
    const { data } = await supabase.from("flags").select("id, observation_id, flagger_id, reason, details, status, created_at");
    if (data) {
      setFlags(data as Flag[]);
    }
  }, []);

  useEffect(() => {
    fetchObservations();
    fetchFlags();
  }, [fetchObservations, fetchFlags]);

  const filteredObservations = observations.filter((obs) => {
    if (filters.status !== "all" && obs.status !== filters.status) return false;
    if (
      filters.species &&
      !(obs.proposed_species ?? "").toLowerCase().includes(filters.species.toLowerCase()) &&
      !(obs.verified_species ?? "").toLowerCase().includes(filters.species.toLowerCase())
    )
      return false;
    return true;
  });

  const addObservation = useCallback(async (obs: Observation) => {
    // Optimistic update
    setObservations((prev) => [obs, ...prev]);

    // Insert to Supabase
    const { photos, observer, location, ...dbObs } = obs;
    // Remove fields that don't exist in the DB
    const insertData = { ...dbObs } as Record<string, unknown>;
    delete insertData.photos;
    delete insertData.observer;
    delete insertData.location;

    const { error } = await supabase.from("observations").insert(insertData);

    if (!error && photos && photos.length > 0) {
      await supabase.from("observation_photos").insert(
        photos.map((p) => ({
          id: p.id,
          observation_id: obs.id,
          storage_path: p.storage_path,
          photo_type: p.photo_type,
          sort_order: p.sort_order,
        }))
      );
    }

    if (error) {
      console.error("Failed to insert observation:", error);
    }
  }, []);

  const getById = useCallback(
    (id: string) => observations.find((o) => o.id === id),
    [observations]
  );

  const flagObservation = useCallback(
    async (observationId: string, flaggerId: string, reason: FlagReason, details?: string) => {
      const newFlag: Flag = {
        id: crypto.randomUUID(),
        observation_id: observationId,
        flagger_id: flaggerId,
        reason,
        details: details || null,
        status: "pending",
        reviewed_by: null,
        reviewed_at: null,
        created_at: new Date().toISOString(),
      };
      // Optimistic
      setFlags((prev) => [...prev, newFlag]);

      await supabase.from("flags").insert({
        observation_id: observationId,
        flagger_id: flaggerId,
        reason,
        details: details || null,
      });
    },
    []
  );

  const getFlagsForObservation = useCallback(
    (observationId: string) => flags.filter((f) => f.observation_id === observationId),
    [flags]
  );

  const hasUserFlagged = useCallback(
    (observationId: string, userId: string) =>
      flags.some((f) => f.observation_id === observationId && f.flagger_id === userId),
    [flags]
  );

  return (
    <ObservationsContext.Provider
      value={{
        observations,
        loading,
        filters,
        setFilters,
        filteredObservations,
        addObservation,
        getById,
        flags,
        flagObservation,
        getFlagsForObservation,
        hasUserFlagged,
        refresh: fetchObservations,
      }}
    >
      {children}
    </ObservationsContext.Provider>
  );
}

export function useObservations() {
  return useContext(ObservationsContext);
}
