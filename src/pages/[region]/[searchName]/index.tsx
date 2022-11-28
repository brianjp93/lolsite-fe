import { useState, useMemo, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryWithPrefetch } from "@/hooks";
import Skeleton from "@/components/general/skeleton";
import Orbit from "@/components/general/spinner";
import MatchCard from "@/components/summoner/matchCard";
import SummonerNotFound from "@/components/summoner/summonerNotFound";
import api from "@/external/api/api";

import type { BasicMatchType } from "@/external/types";
import { useRouter } from "next/router";

export const MODALSTYLE = {
  overlay: {
    zIndex: 2,
    backgroundColor: "#484848b0",
  },
  content: {
    zIndex: 2,
    backgroundColor: "#2c2d2f",
    border: "none",
  },
};

export default function Summoner() {
  const router = useRouter();
  const { region, searchName, match } = router.query as {
    region: string;
    searchName: string;
    match?: string;
  };
  console.log({region, searchName})
  const [lastRefresh, setLastRefresh] = useState<undefined | number>();
  const [isInitialQuery, setIsInitialQuery] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 10;

  const custom_max_width = "col l10 offset-l1 m12 s12";

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

  const matchQueryWithSync = useQueryWithPrefetch(
    [
      "matches-with-sync",
      "by-summoner",
      searchName,
      region,
      start,
      limit,
      true,
    ],
    () =>
      api.match
        .getMatchesBySummonerName({
          summoner_name: searchName,
          region,
          start,
          limit,
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
    ],
    () =>
      api.match
        .getMatchesBySummonerName({
          summoner_name: searchName,
          region,
          start: start + limit,
          limit,
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
  const icon = summoner?.profile_icon;
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
  const spectateData = spectateQuery.isSuccess ? spectateQuery.data : undefined;

  const match_ids = matches.map((x: any) => x.id);
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

  const matchFilterOnUpdate = useCallback((data: any) => {
    setPage(1);
  }, []);

  const pagination = () => {
    const disabled = {
      disabled: isMatchLoading,
    };
    return (
      <div>
        <button
          {...disabled}
          onClick={() => setPage((x) => Math.max(1, x - 1))}
          className="btn btn-default inline"
        >
          left
        </button>
        <button
          {...disabled}
          style={{ marginLeft: 8 }}
          onClick={() => setPage((x) => x + 1)}
          className="btn btn-default inline"
        >
          right
        </button>
        <div style={{ display: "inline-block", marginLeft: 8 }}>{page}</div>
        {isMatchLoading && (
          <div style={{ display: "inline-block", marginLeft: 10 }}>
            <Orbit size={25} />
          </div>
        )}
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
              <Orbit size={300} style={{ margin: "auto" }} />
            </div>
          </div>
        )}

        {matchQueryWithSync.isSuccess && !summonerQuery.isSuccess && (
          <SummonerNotFound />
        )}

        {(matchQueryWithSync.isSuccess || matchQueryWithSync.isSuccess) &&
          summonerQuery.isSuccess && (
            <div>
              {matches.length > 0 && summoner && <div>show match ?</div>}

              <div className="row">
                <div className={`${custom_max_width}`}>
                  <div className="row">
                    <div
                      style={{ maxWidth: 415 }}
                      className="col l4 m12 collapsible-col"
                    >
                      <div
                        style={{
                          verticalAlign: "top",
                        }}
                      ></div>
                    </div>
                    <div className="col l8 m12">
                      {pagination()}
                      {matchQueryWithSync.isLoading && (
                        <div style={{ width: 600 }}>
                          <Orbit
                            size={200}
                            style={{
                              margin: "auto",
                            }}
                          />
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
              </div>
            </div>
          )}
      </div>
    </Skeleton>
  );
}
