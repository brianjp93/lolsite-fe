import { useState, useEffect } from "react";
import {
  useQuery,
  useQueryClient,
  type UseQueryOptions,
  type QueryKey,
  type QueryFunction,
  type UseQueryResult,
} from "@tanstack/react-query";
import api from "@/external/api/api";

import type {
  ChampionType,
  UserType,
  RuneType,
  BasicChampionWithImageType,
} from "@/external/types";
import { rankParticipants } from "./components/summoner/rankParticipants";
import type { QueueType } from "./external/iotypes/data";

export function useDebounce<V>(value: V, delay: number) {
  // State and setters for debounced value
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(
    () => {
      // Update debounced value after delay
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);
      // Cancel the timeout if value changes (also on delay change or unmount)
      // This is how we prevent debounced value from updating if value is changed ...
      // .. within the delay period. Timeout gets cleared and restarted.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Only re-call effect if value or delay changes
  );
  return debouncedValue;
}

export const userKey = ['my-user']
export function useUser() {
  const userQuery = useQuery(userKey, api.player.getMyUser, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
  });
  return userQuery
}

export function useItem({
  id,
  major,
  minor,
}: {
  id: number;
  major: number | string;
  minor: number | string;
}) {
  return useQuery(
    ["item", id, major, minor],
    () =>
      api.data
        .getItem({ item_id: id, major, minor })
        .then((response) => response.data.data),
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 10,
    }
  );
}

export function useChampions(): Record<number, ChampionType> {
  const championQuery = useQuery(
    ["champions"],
    () => api.data.getChampions().then((x) => x.data.data),
    { retry: true, refetchOnWindowFocus: false, staleTime: 1000 * 60 * 10 }
  );
  const champions: Record<number, ChampionType> = {};
  for (const champ of championQuery.data || []) {
    champions[champ.key] = champ;
  }
  return champions;
}

export function useBasicChampions(): Record<
  number,
  BasicChampionWithImageType
> {
  const championQuery = useQuery(
    ["basic-champions"],
    () => api.data.basicChampions().then((x) => x.results),
    { retry: true, refetchOnWindowFocus: false, staleTime: 1000 * 60 * 10 }
  );
  const champions: Record<number, BasicChampionWithImageType> = {};
  for (const champ of championQuery.data || []) {
    champions[champ.key] = champ;
  }
  return champions;
}

export function useRunes(version: string) {
  const runesQuery = useQuery(
    ["runes", version],
    () => api.data.getRunes({ version }),
    { retry: false, refetchOnWindowFocus: false, staleTime: 1000 * 60 * 60 }
  );
  const runes: Record<number, RuneType> = {};
  for (const rune of runesQuery.data || []) {
    runes[rune._id] = rune;
  }
  return runes;
}

export function useQueryWithPrefetch<T>(
  key: QueryKey,
  request: QueryFunction<T>,
  prefetchKey: QueryKey,
  prefetchRequest: QueryFunction<T>,
  options: UseQueryOptions<T>
): UseQueryResult<T, unknown> {
  const queryClient = useQueryClient();
  const matchQuery = useQuery(key, request, options);
  // prefetch next page
  queryClient.prefetchQuery(prefetchKey, prefetchRequest, options);
  return matchQuery;
}

export function useSummonerSearch({
  name,
  region,
  onSuccess,
}: {
  name: string;
  region: string;
  onSuccess?: () => void;
}) {
  name = name.split(/\s+/).join("").toLowerCase();
  const query = useQuery(
    ["summoner-search", name, region],
    () => api.player.summonerSearch({ simple_name__icontains: name, region }),
    {
      staleTime: 1000 * 60 * 2,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      enabled: name.length >= 3,
      onSuccess: () => onSuccess && onSuccess(),
    }
  );
  return query;
}

export function useMatch(matchId: string) {
  const matchQuery = useQuery(
    ["full-match", matchId],
    () => api.match.getMatch(matchId),
    {
      retry: true,
      refetchOnWindowFocus: false,
      enabled: !!matchId,
      refetchOnMount: false,
      staleTime: 1000 * 60 * 10,
    }
  );
  return matchQuery;
}

export function useParticipants(matchId: string) {
  const participantQuery = useQuery(
    ["participants", matchId],
    () =>
      api.match
        .participants({ match__id: matchId, apply_ranks: true })
        .then((response) => rankParticipants(response.data)),
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: !!matchId,
      refetchOnMount: false,
      staleTime: 1000 * 60 * 10,
    }
  );
  return participantQuery;
}

export function useMatchList({
  name,
  region,
  start,
  limit,
  sync,
  queue,
  onSuccess,
  onError,
  onSettled,
  keepPreviousData = true,
}: {
  name: string;
  region: string;
  start: number;
  limit: number;
  sync: boolean;
  queue?: number;
  onSuccess: () => void;
  onError: () => void;
  onSettled?: () => void;
  keepPreviousData?: boolean;
}) {
  const query = useQuery(
    [
      "matches-with-sync",
      "by-summoner",
      name,
      region,
      start,
      limit,
      sync,
      queue,
    ],
    () =>
      api.match
        .getMatchesBySummonerName({
          summoner_name: name,
          region,
          start,
          limit,
          queue,
          sync_import: sync,
        })
        .then((x) => x.results),
    {
      retry: true,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      keepPreviousData,
      staleTime: 1000 * 60 * 3,
      cacheTime: 1000 * 60 * 3,
      enabled: !!name && !!region,
      onSuccess: () => onSuccess(),
      onError: () => onError(),
      onSettled: () => onSettled && onSettled(),
    }
  );
  return query;
}

export function useTimeline({ matchId }: { matchId: string }) {
  const query = useQuery(
    ["timeline", matchId],
    () =>
      api.match.timeline(matchId).then((data) => {
        data.sort((a, b) => a.timestamp - b.timestamp);
        return data;
      }),
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: !!matchId,
      refetchOnMount: false,
      staleTime: 1000 * 60 * 30,
    }
  );
  return query;
}

export function useQueues() {
  return useQuery(
    ["queues-data"],
    async () => {
      const data = await api.data.getQueues();
      const out: Record<number, QueueType> = {};
      for (const x of data) {
        x.description = x.description.replace("games", "").trim();
        if (x.description === "Co-op vs. AI Intermediate Bot") {
          x.description = "Co-op vs Bots Int";
        }
        out[x._id] = x;
      }
      return out;
    },
    {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 60,
    }
  );
}

export function useSummoner({
  region,
  name,
}: {
  region: string;
  name: string;
}) {
  return useQuery(
    ["summoner", "name", name, region],
    () => api.player.getSummonerByName(name, region),
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 1000 * 60 * 5,
      enabled: !!region && !!name,
    }
  );
}

export function usePositions({
  summoner_id,
  region,
}: {
  summoner_id: string;
  region: string;
}) {
  const query = useQuery(
    ["positions", summoner_id, region],
    () =>
      summoner_id
        ? api.player
            .getPositions({ summoner_id, region })
            .then((x) => x.data.data)
        : undefined,
    { retry: false, refetchOnWindowFocus: false, enabled: !!summoner_id }
  );
  return query;
}

export function useCsrf() {
  const query = useQuery(
    ["csrf-token"],
    () => api.general.getCsrf(),
    {
      staleTime: 1000 * 60 * 5,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  )
  return query
}
