import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryWithPrefetch } from "@/hooks";
import Skeleton from "@/components/general/skeleton";
import Orbit from "@/components/general/spinner";
import MatchCard from "@/components/summoner/matchCard";
import SummonerNotFound from "@/components/summoner/summonerNotFound";
import api from "@/external/api/api";
import clsx from "clsx";

import type { BasicMatchType } from "@/external/types";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

export default function Summoner() {
  const router = useRouter();
  const { region, searchName } = router.query as {
    region: string;
    searchName: string;
  };
  const [lastRefresh, setLastRefresh] = useState<undefined | number>();
  const [isInitialQuery, setIsInitialQuery] = useState(true);
  const [page, setPage] = useState(1);
  const [filterData, setFilterData] = useState<MatchFilterSchema>({});
  const limit = 10;

  const start = limit * page - limit;

  const summonerQuery = useQuery(
    ["summoner", "name", searchName, region],
    () => api.player.getSummonerByName(searchName, region),
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: !!searchName && !!region,
    }
  );
  const summonerQueryRefetch = summonerQuery.refetch;

  useEffect(() => {
    setIsInitialQuery(true);
    setFilterData({});
  }, [searchName]);

  const matchQueryWithSync = useQueryWithPrefetch(
    [
      "matches-with-sync",
      "by-summoner",
      searchName,
      region,
      start,
      limit,
      true,
      filterData,
    ],
    () =>
      api.match
        .getMatchesBySummonerName({
          summoner_name: searchName,
          region,
          start,
          limit,
          queue: filterData.queue,
          sync_import: true,
        })
        .then((x) => x.results),
    [
      "matches-with-sync",
      "by-summoner",
      searchName,
      region,
      start + limit,
      limit,
      true,
      filterData,
    ],
    () =>
      api.match
        .getMatchesBySummonerName({
          summoner_name: searchName,
          region,
          start: start + limit,
          limit,
          queue: filterData.queue,
          sync_import: true,
        })
        .then((x) => x.results),
    {
      retry: true,
      refetchOnWindowFocus: false,
      keepPreviousData: true,
      staleTime: 1000 * 60 * 3,
      enabled: !!searchName && !!region,
      onSuccess: () => {
        setLastRefresh(Date.now());
        setIsInitialQuery(false);
      },
      onError: () => {
        if (page > 1) {
          setPage(page - 1);
        }
      },
    }
  );
  const matchQueryWithSyncRefetch = matchQueryWithSync.refetch;

  const isMatchLoading = matchQueryWithSync.isFetching;

  const summoner = summonerQuery.data;
  const matches: BasicMatchType[] = matchQueryWithSync.data || [];
  const positionQuery = useQuery(
    ["positions", summoner?._id, region],
    () =>
      summoner?._id
        ? api.player
            .getPositions({ summoner_id: summoner._id, region })
            .then((x) => x.data.data)
        : undefined,
    { retry: false, refetchOnWindowFocus: false, enabled: !!summoner?._id }
  );
  const positionQueryRefetch = positionQuery.refetch;

  const refreshPage = useCallback(() => {
    setPage(1);
    matchQueryWithSyncRefetch();
    summonerQueryRefetch();
    positionQueryRefetch();
  }, [
    setPage,
    matchQueryWithSyncRefetch,
    summonerQueryRefetch,
    positionQueryRefetch,
  ]);

  // refresh page if the summoner changes
  useEffect(() => {
    refreshPage();
  }, [summoner?.simple_name, refreshPage]);

  const spectateQuery = useQuery(
    ["spectate", region, summoner?._id],
    () =>
      api.match
        .getSpectate({ region, summoner_id: summoner!._id })
        .then((x) => x.data),
    {
      retry: false,
      enabled: !!summoner?._id,
    }
  );

  const match_ids = matches.map((x) => x.id);
  const commentQuery = useQuery(
    ["comment_count", match_ids],
    () =>
      api.player
        .getCommentCount({ match_ids: match_ids })
        .then((response) => response.data.data),
    {
      retry: false,
      refetchOnWindowFocus: false,
      enabled: matches.length > 0,
      staleTime: 1000 * 60 * 3,
    }
  );

  const pagination = () => {
    return (
      <div className="flex">
        <button
          onClick={() => setPage((x) => Math.max(1, x - 1))}
          className={clsx("btn btn-default", {
            disabled: isMatchLoading || page <= 1,
          })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-3 w-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <button
          onClick={() => setPage((x) => x + 1)}
          className={clsx("btn btn-default ml-2", {
            disabled: isMatchLoading,
          })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-3 w-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
        <div className="mx-2">{page}</div>
        {isMatchLoading && <Orbit size={25} />}
      </div>
    );
  };

  return (
    <Skeleton topPad={0}>
      <div style={{ minHeight: 1000 }}>
        {isMatchLoading && isInitialQuery && (
          <div>
            <div
              style={{
                textAlign: "center",
                marginTop: 100,
              }}
            >
              <Orbit size={300} className="m-auto" />
            </div>
          </div>
        )}

        {summonerQuery.isError && !summonerQuery.isFetching && (
          <SummonerNotFound />
        )}

        {!isInitialQuery &&
          matchQueryWithSync.isSuccess &&
          summonerQuery.isSuccess && (
            <div className="flex">
              <div>
                <div className="my-2 w-full">
                  <MatchFilter onSubmit={(data) => {
                    setFilterData(data)
                  }} />
                </div>
                <div>
                  {pagination()}
                  {matchQueryWithSync.isLoading && (
                    <div style={{ width: 600 }}>
                      <Orbit size={200} className="m-auto" />
                    </div>
                  )}
                  {!matchQueryWithSync.isLoading &&
                    summoner &&
                    matches.map((match: BasicMatchType, key: number) => {
                      return (
                        <MatchCard
                          key={`${key}-${match._id}`}
                          match={match}
                          summoner={summoner}
                        />
                      );
                    })}
                  {pagination()}
                </div>
              </div>
            </div>
          )}
      </div>
    </Skeleton>
  );
}

const QUEUEFILTER = {
  420: "5v5 Ranked Solo/Duo",
  440: "5v5 Ranked Flex",
  400: "5v5 Norms Draft",
  430: "5v5 Norms Blind",
  0: "Custom Games",
  700: "Clash",
  450: "ARAM",
} as const;

const MatchFilterSchema = z.object({
  queue: z.number().optional(),
});
type MatchFilterSchema = z.infer<typeof MatchFilterSchema>;

function MatchFilter({
  className = "",
  onSubmit,
}: React.PropsWithChildren<{ className?: string, onSubmit: (data: MatchFilterSchema) => void }>) {
  const {
    register,
    getValues,
  } = useForm<MatchFilterSchema>({ resolver: zodResolver(MatchFilterSchema) });

  return (
    <div className={className}>
      <form
        onChange={async () => {
          onSubmit(getValues())
        }}
      >
        <label htmlFor="">Queue</label>
        <select {...register("queue")} className='w-full default px-1 rounded'>
          <option value={undefined}>Any</option>
          {Object.keys(QUEUEFILTER).map((x) => {
            const queue = parseInt(x) as keyof typeof QUEUEFILTER;
            const name = QUEUEFILTER[queue];
            return (
              <option key={queue} value={queue}>
                {name}
              </option>
            );
          })}
        </select>
      </form>
    </div>
  );
}
