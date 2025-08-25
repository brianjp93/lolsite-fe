import { useCallback, useEffect, useState } from "react";
import {
  useMatchList,
  useNameChanges,
  usePositions,
  useSummoner,
  useSuspiciousAccount,
} from "@/hooks";
import Skeleton from "@/components/general/skeleton";
import Orbit from "@/components/general/spinner";
import MatchCard from "@/components/summoner/matchCard";
import SummonerNotFound from "@/components/summoner/summonerNotFound";
import api from "@/external/api/api";
import clsx from "clsx";
import {
  useQueryParams,
  NumberParam,
  withDefault,
  StringParam,
} from "use-query-params";

import type { BasicMatchType } from "@/external/types";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileCardInner } from "@/components/summoner/matchDetails/profileCard";
import Head from "next/head";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import type { MetaHead } from "@/external/iotypes/base";
import { RecentlyPlayedWith } from "@/components/summoner/recentlyPlayedWith";
import { PlayerChampionSummary } from "@/components/summoner/PlayerChampionSummary";
import { MatchListSummary } from "@/components/summoner/SummonerSummary";
import { getRiotIdAndTaglineFromSearchName } from "@/utils/constants";

export default function Summoner({
  meta,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const router = useRouter();
  const { region, searchName } = router.query as {
    region: string;
    searchName: string;
  };
  const [riot_id_name, riot_id_tagline] =
    getRiotIdAndTaglineFromSearchName(searchName);
  const [prevSearchName, setPrevSearchName] = useState("");
  const [params, setParams] = useQueryParams({
    page: withDefault(NumberParam, 1),
    queue: withDefault(NumberParam, undefined),
    playedWith: withDefault(StringParam, ""),
  });
  const limit = 10;

  function resetPage() {
    setParams({ ...params, page: 1 });
  }

  const start = limit * params.page - limit;
  const summonerQuery = useSummoner({
    region,
    riotIdName: riot_id_name,
    riotIdTagline: riot_id_tagline,
  });
  const summoner = summonerQuery.data;

  if (summoner?.summoner_level === 0) {
    setTimeout(summonerQuery.refetch, 3000);
  }

  const matchQuery = useMatchList({
    riot_id_name,
    riot_id_tagline,
    region,
    start,
    limit,
    sync: true,
    queue: params.queue,
    playedWith: params.playedWith,
    keepPreviousData: searchName === prevSearchName,
  });

  const susAccountQ = useSuspiciousAccount(
    summoner?.puuid || "",
    !!summoner?.puuid && matchQuery.isSuccess
  );
  const susAccount = susAccountQ.data;

  const flexFFGamePercentage = susAccount
    ? susAccount.quick_ff_count / (susAccount.total || 1)
    : 0;

  useEffect(() => {
    if (matchQuery.isSuccess) {
      setPrevSearchName(searchName);
    }
  }, [searchName, matchQuery.isSuccess]);
  const isInitialQuery = !matchQuery.data;

  const matches: BasicMatchType[] = matchQuery.data || [];
  const positionQuery = usePositions({
    region,
    puuid: summoner?.puuid || "",
  });
  const positions = positionQuery.data;

  const nameChangeQuery = useNameChanges(summoner?.id || 0);
  const nameChanges = nameChangeQuery.data || [];

  const pagination = () => {
    return (
      <div className="flex">
        <button
          onClick={() =>
            setParams((x) => {
              return { ...x, page: Math.max(1, (x.page || 1) - 1) };
            })
          }
          className={clsx("btn btn-default", {
            disabled: matchQuery.isFetching || params.page <= 1,
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
          onClick={() =>
            setParams((x) => {
              return { ...x, page: (x.page || 1) + 1 };
            })
          }
          className={clsx("btn btn-default ml-2", {
            disabled: matchQuery.isFetching,
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
        <div className="mx-2 my-auto">{params.page}</div>
        {params.page !== 1 && (
          <div>
            <button onClick={resetPage} className="btn btn-link">
              reset
            </button>
          </div>
        )}
        {matchQuery.isFetching && <Orbit size={25} />}
      </div>
    );
  };

  return (
    <Skeleton topPad={0}>
      <Head>
        <title>{searchName.trim()} | hardstuck.club</title>
        {meta && (
          <>
            <meta property="og:type" content={meta.type} />
            <meta property="og:url" content={meta.url} />
            <meta property="og:title" content={meta.title} />
            <meta property="og:description" content={meta.description} />
            <meta property="og:image" content={meta.image} />
          </>
        )}
      </Head>
      <div style={{ minHeight: 1000 }} className="mx-auto flex-col">
        {searchName.indexOf("-") === -1 &&
          <div className="mt-4 flex flex-col gap-y-2">
            <div className="mb-4">
              Error while searching for summoner.
            </div>
            <div>
              Riot has updated summoner names to use your RiotIdName + RiotTagline.
            </div>
            <div>
              Make sure to search for your name, using a &quot;#&quot; between your name and tagline.
            </div>
            <div className="mt-4">
              Ex:
              <span className="font-bold ml-2">yourName#tagline</span>
            </div>
          </div>
        }
        {summoner && (
          <div className="flex">
            <ProfileCardInner
              summoner={summoner}
              positions={positions}
              nameChanges={nameChanges}
            />
            {flexFFGamePercentage > 0.05 &&
              (susAccount?.quick_ff_count || 0) > 4 && (
                <div className="ml-2 max-w-fit rounded-md bg-red-800/50 p-2 font-bold">
                  This summoner has suspicious activity
                  <br />
                  {susAccount?.quick_ff_count} ff&apos;d (&lt;5min games) in{" "}
                  {susAccount?.total} total games.
                </div>
              )}
          </div>
        )}
        {matchQuery.isFetching && isInitialQuery && (
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

        {!isInitialQuery && matchQuery.isSuccess && summonerQuery.isSuccess && (
          <div className="flex">
            <div>
              {summoner && (
                <>
                  <div className="my-2 w-full max-w-[950px] rounded-md bg-zinc-800 p-4">
                    <PlayerChampionSummary puuid={summoner.puuid} />
                  </div>
                </>
              )}
              <div className="my-2 w-full">
                <MatchFilter
                  onSubmit={(data) => {
                    setParams({
                      ...params,
                      queue: data.queue,
                      playedWith: data.playedWith,
                    });
                  }}
                />
              </div>
              <div>
                {pagination()}
                {matchQuery.isLoading && (
                  <div style={{ width: 600 }}>
                    <Orbit size={200} className="m-auto" />
                  </div>
                )}
                {!matchQuery.isLoading && summoner && (
                  <div className="flex">
                    <div>
                      <div className="my-2 w-full">
                        <MatchListSummary
                          matches={matches}
                          summoner={summoner}
                          champCount={5}
                        />
                      </div>
                      {matches.map((match: BasicMatchType, key: number) => {
                        return (
                          <MatchCard
                            key={`${key}-${match._id}`}
                            match={match}
                            summoner={summoner}
                          />
                        );
                      })}
                    </div>
                    <div>
                      <div className="ml-2 hidden rounded-md bg-zinc-800 md:block">
                        <RecentlyPlayedWith
                          summoner={summoner}
                          matches={matches}
                          region={region}
                        />
                      </div>
                    </div>
                  </div>
                )}
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
  490: "Normal (Quickplay)",
  1700: "2v2v2v2",
  0: "Custom Games",
  700: "Clash",
  720: "ARAM Clash",
  450: "ARAM",
  1900: "U.R.F.",
} as const;

const MatchFilterSchema = z.object({
  queue: z.number().optional(),
  playedWith: z.string().optional().default(""),
});
type MatchFilterSchema = z.infer<typeof MatchFilterSchema>;

function MatchFilter({
  className = "",
  onSubmit,
}: React.PropsWithChildren<{
  className?: string;
  onSubmit: (data: MatchFilterSchema) => void;
}>) {
  const { queue, playedWith } = useRouter().query as {
    queue?: number;
    playedWith?: string;
  };
  const { register, getValues, handleSubmit } = useForm<MatchFilterSchema>({
    resolver: zodResolver(MatchFilterSchema),
    defaultValues: { queue, playedWith },
  });

  const onChange = useCallback(async () => {
    onSubmit(getValues());
  }, [getValues, onSubmit]);

  return (
    <div className={className}>
      <form onSubmit={handleSubmit(() => null)}>
        <label htmlFor="queue" className="w-14">
          Queue
        </label>
        <select
          {...register("queue", { onChange })}
          className="default w-full rounded !py-2"
        >
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
        <label className="my-2">
          <div>Played With (comma separated list of names)</div>
          <input
            className="w-full"
            type="text"
            {...register("playedWith", { onBlur: onChange })}
          />
        </label>
      </form>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<{
  meta: MetaHead | null;
}> = async (context) => {
  const { region, searchName } = context.query as {
    region: string;
    searchName: string;
  };
  const isFirstLoad = !(context.req?.url || "").includes("_next/data");
  let meta = null;
  if (isFirstLoad) {
    meta = await api.general.getSummonerMetaData({
      name: searchName,
      region,
    });
  }
  return { props: { meta } };
};
