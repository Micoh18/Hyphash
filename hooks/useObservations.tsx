"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { Observation, ObservationStatus, Flag, FlagReason } from "@/types";
import { MOCK_OBSERVATIONS } from "@/lib/mock-data";

interface Filters {
  status: ObservationStatus | "all";
  species: string;
}

interface ObservationsState {
  observations: Observation[];
  filters: Filters;
  setFilters: (filters: Filters) => void;
  filteredObservations: Observation[];
  addObservation: (obs: Observation) => void;
  getById: (id: string) => Observation | undefined;
  flags: Flag[];
  flagObservation: (observationId: string, flaggerId: string, reason: FlagReason, details?: string) => void;
  getFlagsForObservation: (observationId: string) => Flag[];
  hasUserFlagged: (observationId: string, userId: string) => boolean;
}

const ObservationsContext = createContext<ObservationsState>(
  {} as ObservationsState
);

export function ObservationsProvider({ children }: { children: ReactNode }) {
  const [observations, setObservations] =
    useState<Observation[]>(MOCK_OBSERVATIONS);
  const [flags, setFlags] = useState<Flag[]>([]);
  const [filters, setFilters] = useState<Filters>({
    status: "all",
    species: "",
  });

  const filteredObservations = observations.filter((obs) => {
    if (filters.status !== "all" && obs.status !== filters.status) return false;
    if (
      filters.species &&
      !(obs.proposed_species ?? "")
        .toLowerCase()
        .includes(filters.species.toLowerCase()) &&
      !(obs.verified_species ?? "")
        .toLowerCase()
        .includes(filters.species.toLowerCase())
    )
      return false;
    return true;
  });

  const addObservation = useCallback((obs: Observation) => {
    setObservations((prev) => [obs, ...prev]);
  }, []);

  const getById = useCallback(
    (id: string) => observations.find((o) => o.id === id),
    [observations]
  );

  const flagObservation = useCallback(
    (observationId: string, flaggerId: string, reason: FlagReason, details?: string) => {
      const newFlag: Flag = {
        id: `flag-${Date.now()}`,
        observation_id: observationId,
        flagger_id: flaggerId,
        reason,
        details: details || null,
        status: "pending",
        reviewed_by: null,
        reviewed_at: null,
        created_at: new Date().toISOString(),
      };
      setFlags((prev) => [...prev, newFlag]);
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
        filters,
        setFilters,
        filteredObservations,
        addObservation,
        getById,
        flags,
        flagObservation,
        getFlagsForObservation,
        hasUserFlagged,
      }}
    >
      {children}
    </ObservationsContext.Provider>
  );
}

export function useObservations() {
  return useContext(ObservationsContext);
}
