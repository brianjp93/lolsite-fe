import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  UseQueryOptions,
  QueryKey,
  QueryFunction,
  UseQueryResult,
} from "@tanstack/react-query";
import api from "@/external/api/api";

import type {
  ChampionType,
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

export const userKey = ["my-user"];
export function useUser() {
  const userQuery = useQuery(userKey, api.player.getMyUser, {
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
  });
  return userQuery;
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

export function useAllItems({
  major,
  minor,
  patch,
  map_id,
}: {
  major?: number;
  minor?: number;
  patch?: number;
  map_id?: number;
}) {
  return useQuery(
    ["all-items"],
    () => api.data.items({ major, minor, patch, map_id }),
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 10,
    }
  );
}

export function useSimpleItem({
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
        .getSimpleItem(id, major, minor)
        .then((response) => response.data),
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 10,
      enabled: !!id,
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
  name = name.split(/\s+/).join("");
  const query = useQuery(
    ["summoner-search", name, region],
    () => api.player.summonerSearch({ simple_riot_id__icontains: name, region }),
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
  riot_id_name,
  riot_id_tagline,
  region,
  start,
  limit,
  sync,
  queue,
  playedWith,
  onSuccess,
  onError,
  onSettled,
  keepPreviousData = true,
}: {
  riot_id_name: string;
  riot_id_tagline: string;
  region: string;
  start: number;
  limit: number;
  sync: boolean;
  queue?: number;
  playedWith?: string;
  onSuccess: () => void;
  onError: () => void;
  onSettled?: () => void;
  keepPreviousData?: boolean;
}) {
  const query = useQuery(
    [
      "matches-with-sync",
      "by-summoner",
      riot_id_name,
      riot_id_tagline,
      region,
      start,
      limit,
      sync,
      queue,
      playedWith,
    ],
    () =>
      api.match
        .getMatchesByRiotIdName({
          riot_id_name,
          riot_id_tagline,
          region,
          start,
          limit,
          queue,
          playedWith,
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
      enabled: !!riot_id_name && !!region && !!riot_id_tagline,
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
  riotIdName,
  riotIdTagline,
}: {
  region: string;
  riotIdName: string;
  riotIdTagline: string;
}) {
  return useQuery(
    ["summoner", "name", riotIdName, riotIdTagline, region],
    () => api.player.getSummonerByRiotId(riotIdName, riotIdTagline, region),
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 1000 * 60 * 5,
      enabled: !!region && !!riotIdName && !!riotIdTagline,
    }
  );
}

export function useSummonerByPuuid({
  puuid,
}: {
  puuid: string;
}) {
  return useQuery(
    ["summoner", "puuid", puuid],
    () => api.player.getSummoner({puuid}),
    {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 1000 * 60 * 5,
    }
  )
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
        ? api.player.getPositions({ summoner_id, region })
        : undefined,
    { retry: false, refetchOnWindowFocus: false, enabled: !!summoner_id }
  );
  return query;
}

export function useNameChanges(summoner_id: number) {
  return useQuery(
    ["name-change", summoner_id],
    () => api.player.getNameChanges(summoner_id),
    {
      enabled: !!summoner_id,
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    }
  );
}

const banQueryKey = (match_id: string) => ["match-bans", match_id];
export function useBans(match_id: string) {
  return useQuery(banQueryKey(match_id), () => api.match.bans(match_id), {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60,
  });
}

export function useFavorites({ enabled = true }: { enabled?: boolean }) {
  return useQuery(["favorites"], () => api.player.getFavorites(), {
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60,
    enabled,
  });
}

export function usePlayerSummary({
  puuid,
  start = 0,
  end = 5,
  order_by = "-count",
  start_datetime,
  end_datetime,
  season,
  queue_in,
}: {
  puuid: string;
  start?: number;
  end?: number;
  order_by?: string;
  start_datetime?: Date;
  end_datetime?: Date;
  season?: number;
  queue_in?: number[];
}) {
  return useQuery(
    [
      "player-summary",
      puuid,
      start,
      end,
      start_datetime,
      end_datetime,
      season,
      queue_in ? queue_in.join(",") : queue_in,
    ],
    () =>
      api.player.getChampionsOverview({
        puuid,
        start,
        end,
        order_by,
        start_datetime,
        end_datetime,
        season,
        queue_in,
      }),
    {
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 60,
      enabled: !!puuid,
    }
  );
}

export function useSimpleSpectate(summoner_id: string, region: string) {
  return useQuery(
    ["simple-spectate", summoner_id, region],
    () =>
      api.match.checkForLiveGame({ summoner_id, region }).then((response) => {
        if (response === "not found") {
          return null;
        }
        return response;
      }),
    {
      refetchInterval: 1000 * 60,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: false,
      enabled: !!(summoner_id && region),
    }
  );
}

export function useConnectedSummoners() {
  return useQuery(
    ["connected-summoners"],
    () => api.player.getConnectedAccounts(),
    {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 60,
    }
  );
}

export function useSuspiciousAccount(puuid: string, enabled = true) {
  return useQuery(
    ["sus-account", puuid],
    () => api.player.isSuspicious(puuid),
    {
      retry: false,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      enabled: enabled,
    }
  );
}

export function useSpectate(
  region: string,
  summoner_id: string,
  refetchInterval?: number,
  enabled?: boolean
) {
  return useQuery(
    ["spectate", region, summoner_id],
    () =>
      api.match.getSpectate({ region, summoner_id }).then((x) => {
        if (x === "not found") {
          return null;
        }
        return x;
      }),
    {
      retry: false,
      refetchInterval,
      enabled,
    }
  );
}

export function useComment(pk: number) {
  return useQuery(["comment", pk], () => api.player.getComment(pk), {
    staleTime: 1000 * 3600 * 24,
  });
}

export function useGoogleRecaptchaSiteKey() {
  return useQuery(
    ["google-recaptcha-site-key"],
    api.data.getGoogleRecaptchaSiteKey,
    {
      retry: true,
      staleTime: 1000 * 3600,
    }
  );
}
