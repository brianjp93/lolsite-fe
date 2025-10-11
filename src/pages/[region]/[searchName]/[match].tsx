import { Fragment, useState } from "react";
import Skeleton from "@/components/general/skeleton";
import {
  useBans,
  useMatch,
  useParticipants,
  useSummoner,
  useTimeline,
  useQueues,
  useBasicChampions,
  useSimpleSpectate,
} from "@/hooks";
import { useRouter } from "next/router";
import type { SimpleMatchType, SummonerType } from "@/external/types";
import Orbit from "@/components/general/spinner";
import type { AppendParticipant } from "@/components/summoner/rankParticipants";
import Link from "next/link";
import { profileRoute, puuidRoute } from "@/routes";
import type { BanType, FrameType, AdvancedTimelineType } from "@/external/iotypes/match";
import { StringParam, useQueryParam, withDefault } from "use-query-params";
import {
  convertRank,
  convertTier,
  getLoser,
  getMyPart,
  getWinner,
  mediaUrl,
} from "@/components/utils";
import {
  ChampionClump,
  ItemClump,
  StatClump,
  BountyClump,
} from "@/components/summoner/matchCard";
import clsx from "clsx";
import numeral from "numeral";
import { MapEventsInner } from "@/components/summoner/matchDetails/mapEvents";
import { Timeline } from "@/components/summoner/matchDetails/gameTimeline";
import { ChampionTimelinesInner } from "@/components/summoner/matchDetails/championTimelines";
import { StatOverview } from "@/components/summoner/matchDetails/championStats";
import BuildOrder from "@/components/summoner/matchDetails/buildOrder";
import { RunePage } from "@/components/summoner/matchDetails/runePage";
import Image from "next/image";
import { formatDatetimeFull } from "@/components/utils";
import { PingStats } from "@/components/summoner/matchDetails/pingStats";
import { Popover } from "react-tiny-popover";
import type { GetServerSidePropsContext } from "next";
import api from "@/external/api/api";
import type { MetaHead } from "@/external/iotypes/base";
import Head from "next/head";
import { InGameDot } from "@/components/general/favoriteList";
import {
  ARENA_QUEUE,
  getRiotIdAndTaglineFromSearchName,
} from "@/utils/constants";

export const matchRoute = (region: string, name: string, matchId: string) => {
  return `/${region}/${name}/${matchId}/`;
};

export default function Match({ meta }: { meta: MetaHead | null }) {
  const router = useRouter();
  const {
    searchName,
    match: matchId,
    region,
  } = router.query as { searchName: string; match: string; region: string };
  const [returnPath] = useQueryParam(
    "returnPath",
    withDefault(StringParam, "")
  );
  const [riotIdName, riotIdTagline] =
    getRiotIdAndTaglineFromSearchName(searchName);
  const matchQuery = useMatch(matchId);
  const match = matchQuery.data;
  const participantsQuery = useParticipants(matchId);
  const participants = participantsQuery.data;
  const timelineQuery = useTimeline({ matchId });
  const summonerQ = useSummoner({ region, riotIdName, riotIdTagline });
  const summoner = summonerQ.data;
  const bans = useBans(matchId).data?.results || [];

  return (
    <Skeleton topPad={0}>
      <Head>
        <title>Match Details | hardstuck.club</title>
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
      <div className="ml-10 flex">
        <Link
          href={
            returnPath
              ? returnPath
              : profileRoute({ region, riotIdName, riotIdTagline })
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="mr-1 inline h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
            />
          </svg>
          profile
        </Link>
      </div>
      {match && participants && summoner && (
        <InnerMatch
          match={match}
          participants={participants}
          timeline={timelineQuery.data}
          summoner={summoner}
          bans={bans}
        />
      )}
      {matchQuery.isLoading && <Orbit size={50} />}
    </Skeleton>
  );
}

function InnerMatch({
  match,
  participants,
  timeline,
  summoner,
  bans,
}: {
  match: SimpleMatchType;
  participants: AppendParticipant[];
  timeline?: AdvancedTimelineType;
  summoner: SummonerType;
  bans: BanType[];
}) {
  const team100 = getWinner(match.queue_id, participants);
  const team200 = getLoser(match.queue_id, participants);
  const mypart = getMyPart(participants, summoner.puuid);
  const team100Bans = bans.filter((x) => x.team === 100);
  const team200Bans = bans.filter((x) => x.team === 200);
  const queues = useQueues().data || {};
  const minutes = Math.round(match.game_duration / 60_000);
  const seconds = (match.game_duration % 60_000) / 1000;

  const isShowRunes = ![ARENA_QUEUE].includes(match.queue_id);

  return (
    <div>
      <div className="flex justify-center">
        <div className="mr-2 font-bold">
          {queues[match.queue_id]?.description || "Unknown Game Type"}
        </div>
      </div>
      <div className="flex justify-center">
        <div className="mr-2 font-bold">Duration:</div>
        <div>
          {minutes}:{numeral(seconds).format("00")}
        </div>
      </div>
      <div className="flex justify-center">
        <div className="mr-2 font-bold">Game Version:</div>
        <div>{match.game_version}</div>
      </div>
      <div className="flex justify-center">
        <div className="mr-2 font-bold">Played At:</div>
        <div>{formatDatetimeFull(match.game_creation)}</div>
      </div>
      <div className="flex justify-center">
        <div className="quiet-scroll flex w-fit overflow-x-auto rounded bg-zinc-800/40 p-2">
          <div className="my-auto min-w-fit pr-1">
            <TeamSide team={team100} match={match} bans={team100Bans} />
          </div>
          <div className="my-auto rounded-full bg-gradient-to-r from-cyan-700 to-rose-700 p-3 font-bold">
            VS
          </div>
          <div className="my-auto min-w-fit pl-1">
            <TeamSide team={team200} match={match} bans={team200Bans} />
          </div>
        </div>
      </div>
      <div
        className={clsx(
          "mt-2 flex flex-wrap justify-center",
          "m-2 rounded bg-zinc-800/40 p-4"
        )}
      >
        {timeline && (
          <div className="my-2">
            <MapEventsInner
              timeline={timeline.frames}
              participants={participants}
              match={{ _id: match._id }}
            />
          </div>
        )}
        {timeline && (
          <div className="my-2">
            <Timeline
              timeline={timeline.frames}
              match={match}
              participants={participants}
              summoner={summoner}
            />
          </div>
        )}
        {mypart && timeline && (
          <div className="my-2">
            <ChampionTimelinesInner
              matchId={match._id}
              participants={participants}
              summoner={summoner}
              timeline={timeline.frames}
              expanded_width={500}
            />
          </div>
        )}
        {mypart && (
          <div className="my-2">
            <StatOverview
              participants={participants}
              match={match}
              mypart={mypart}
            />
          </div>
        )}
        <div className="my-2">
          <BuildOrder
            timeline={timeline?.frames}
            expanded_width={500}
            participants={participants}
            summoner={summoner}
            match_id={match._id}
          />
        </div>
        {mypart && isShowRunes && (
          <div className="my-2">
            <RunePage
              mypart={mypart}
              participants={participants}
              match={{
                ...match,
                major: match.major ?? 0,
                minor: match.minor ?? 0,
              }}
              matchCardHeight={400}
            />
          </div>
        )}
        {mypart && (
          <div className="my-2">
            <PingStats mypart={mypart} participants={participants} />
          </div>
        )}
      </div>
    </div>
  );
}

function TeamSide({
  team,
  match,
  bans,
}: {
  team: AppendParticipant[];
  match: SimpleMatchType;
  bans: BanType[];
}) {
  let isWin: boolean;
  if (match.queue_id === ARENA_QUEUE) {
    isWin = team[0]?.placement === 1;
  } else {
    isWin = !!team[0]?.stats.win;
  }
  return (
    <div>
      <div
        className={clsx("rounded", {
          "bg-gradient-to-tr from-emerald-600/0 via-teal-700/20 to-emerald-600/30":
            isWin,
        })}
      >
        {team.map((part, key) => {
          return (
            <div key={part._id} className={clsx({ "mt-1": key > 0 })}>
              <ParticipantInfo part={part} match={match} />
            </div>
          );
        })}
      </div>
      <div className="text-center">
        <div className="mt-2 text-lg font-bold">Bans</div>
        <BanList bans={bans} />
      </div>
    </div>
  );
}

function BanList({ bans }: { bans: BanType[] }) {
  const champions = useBasicChampions();
  const [hoveredBan, setHoveredBan] = useState<string | null>(null);

  return (
    <div className="flex justify-around">
      {bans.map((ban) => {
        const url = mediaUrl(champions[ban.champion_id]?.image?.file_40 ?? "");
        const championName = champions[ban.champion_id]?.name || "";
        const banKey = `${ban.team}-${ban.pick_turn}`;

        return (
          <Fragment key={banKey}>
            {!!url && (
              <Popover
                isOpen={hoveredBan === banKey}
                positions={["top", "bottom"]}
                content={
                  <div className="rounded bg-gray-800 px-2 py-1 text-sm text-white shadow-lg">
                    {championName}
                  </div>
                }
              >
                <div
                  onMouseEnter={() => {
                    setHoveredBan(banKey);
                  }}
                  onMouseLeave={() => setHoveredBan(null)}
                >
                  <Image alt={championName} src={url} height={40} width={40} />
                </div>
              </Popover>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}

function ParticipantInfo({
  part,
  match,
}: {
  part: AppendParticipant;
  match: SimpleMatchType;
}) {
  const router = useRouter();
  const { region, searchName } = router.query as {
    region: string;
    searchName: string;
  };
  const [riotIdName, riotIdTagline] =
    getRiotIdAndTaglineFromSearchName(searchName);
  const summoner = useSummoner({ region, riotIdName, riotIdTagline }).data;
  const name = part.riot_id_name.split(/\s+/).join(" ");
  const spectate = useSimpleSpectate(part.puuid, region).data;

  return (
    <div
      className={clsx("flex rounded p-2", {
        "bg-white/10 shadow-md": summoner?.puuid === part.puuid,
      })}
    >
      <div className="my-auto flex h-full flex-col">
        <div className="text-sm font-bold">
          <Link
            className="flex cursor-pointer hover:underline"
            href={puuidRoute(part.puuid)}
          >
            {name ? (
              <>
                <div>{name}</div>
                <div className="text-gray-400">#{part.riot_id_tagline}</div>
              </>
            ) : (
              <>{part.summoner_name}</>
            )}
          </Link>
        </div>
        <div className="flex">
          <div className="my-auto h-full">
            <div className="relative">
              <ChampionClump
                part={part}
                major={match.major ?? 0}
                minor={match.minor ?? 0}
              />
              {spectate && (
                <div className="absolute -left-2 -top-2">
                  <InGameDot
                    queueId={spectate.gameQueueConfigId}
                    startTime={spectate.gameStartTime}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="my-auto ml-2 h-full">
            <ItemClump
              part={part}
              version={{ major: match.major ?? 0, minor: match.minor ?? 0 }}
            />
          </div>
        </div>
      </div>
      <div className="my-auto ml-2 h-full">
        <StatClump part={part} match={match} />
      </div>
      <div className="my-auto ml-2 h-full">
        <BountyClump part={part} match={match} />
      </div>
      <div className="my-auto ml-2 h-full">
        <SecondaryStatClump part={part} match={match} />
      </div>
    </div>
  );
}

function SecondaryStatClump({
  part,
  match,
}: {
  part: AppendParticipant;
  match: SimpleMatchType;
}) {
  const minutes = match.game_duration / 1000 / 60 || 1;
  const stats = part.stats;
  const gpm = stats.gold_earned / minutes;
  const cspm =
    (stats.total_minions_killed + stats.neutral_minions_killed) / minutes;
  const format = (x: number, fmt = "0.00") => numeral(x).format(fmt);
  const rank = convertTier(part.tier ?? "") + convertRank(part.rank ?? "");
  return (
    <div className="w-fit flex-col text-center">
      <div
        className={clsx("w-full rounded px-2 font-bold", {
          "bg-gradient-to-tr from-purple-800 via-fuchsia-700 to-violet-700":
            !!rank,
          "bg-zinc-800": !rank,
        })}
      >
        {rank ? rank : "NA"}
      </div>
      <div
        title={`Rank: ${part.impact_rank || "N/A"}\nOld Rank: ${part.impact_rank_old || "N/A"
          }\nImpact Score: ${format(
            part.impact_score || 0,
            "0.00"
          )}\nOld Impact: ${format(part.impact || 0, "0.00")}`}
      >
        {part.impact_rank ? (
          <div
            className={clsx("mt-1 rounded font-bold", {
              "bg-blue-600": part.impact_rank === 1,
              "bg-orange-600": part.impact_rank === 2,
              "bg-orange-700": part.impact_rank === 3,
              "bg-red-600": part.impact_rank === 4,
              "bg-red-700": part.impact_rank === 5,
              "bg-red-800": part.impact_rank === 6,
              "bg-red-900": part.impact_rank === 7,
              "bg-red-950": part.impact_rank === 8,
              "bg-stone-800": part.impact_rank === 9,
              "bg-stone-900": part.impact_rank === 10,
            })}
          >
            {part.impact_rank === 1 ? "MVP" : part.impact_rank}
          </div>
        ) : (
          <div>
            {format(part?.impact_score || 0, "0.00")}{" "}
            <span className="text-xs">IS</span>
          </div>
        )}
      </div>
      <div>
        {format(gpm, "0")}
        <span className="text-xs">GPM</span>
      </div>
      <div>
        {format(cspm, "0.0")}
        <span className="text-xs">CS/M</span>
      </div>
    </div>
  );
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const isFirstLoad = !(context.req?.url || "").includes("_next/data");
  const { region, searchName, match } = context.query as {
    region: string;
    searchName: string;
    match: string;
  };
  let meta = null;
  if (isFirstLoad) {
    meta = await api.general.getMatchMetaData({
      name: searchName,
      region,
      matchId: match,
    });
  }
  return {
    props: {
      meta,
    },
  };
}
