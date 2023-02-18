import Skeleton from "@/components/general/skeleton";
import {
  useBans,
  useChampions,
  useMatch,
  useParticipants,
  useSummoner,
  useTimeline,
  useQueues,
} from "@/hooks";
import { useRouter } from "next/router";
import type { SimpleMatchType, SummonerType } from "@/external/types";
import Orbit from "@/components/general/spinner";
import type { AppendParticipant } from "@/components/summoner/rankParticipants";
import Link from "next/link";
import { profileRoute } from "@/routes";
import type { BanType, FrameType } from "@/external/iotypes/match";
import { StringParam, useQueryParam, withDefault } from "use-query-params";
import {
  convertRank,
  convertTier,
  getMyPart,
  getTeam,
  mediaUrl,
} from "@/components/utils";
import {
  ChampionClump,
  ItemClump,
  StatClump,
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
import type { GetServerSidePropsContext } from "next";
import api from "@/external/api/api";
import type { MetaHead } from "@/external/iotypes/base";
import Head from "next/head";

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
  const matchQuery = useMatch(matchId);
  const match = matchQuery.data;
  const participantsQuery = useParticipants(matchId);
  const participants = participantsQuery.data;
  const timelineQuery = useTimeline({ matchId });
  const summonerQ = useSummoner({ region, name: searchName });
  const summoner = summonerQ.data;
  const bans = useBans(matchId).data?.results || [];

  return (
    <Skeleton topPad={0}>
      <Head>
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
            returnPath ? returnPath : profileRoute({ region, name: searchName })
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
  timeline?: FrameType[];
  summoner: SummonerType;
  bans: BanType[];
}) {
  const team100 = getTeam(100, participants);
  const team200 = getTeam(200, participants);
  const mypart = getMyPart(participants, summoner.puuid);
  const team100Bans = bans.filter((x) => x.team === 100);
  const team200Bans = bans.filter((x) => x.team === 200);
  const queues = useQueues().data || {};
  return (
    <div>
      <div className="flex justify-center">
        <div className="mr-2 font-bold">
          {queues[match.queue_id]?.description || "Unknown Game Type"}
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
          <div className="min-w-fit pr-1">
            <TeamSide team={team100} match={match} bans={team100Bans} />
          </div>
          <div className="my-auto rounded-full bg-gradient-to-r from-cyan-700 to-rose-700 p-3 font-bold">
            VS
          </div>
          <div className="min-w-fit pl-1">
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
              timeline={timeline}
              participants={participants}
              match={{ _id: match._id }}
            />
          </div>
        )}
        {timeline && (
          <div className="my-2">
            <Timeline
              timeline={timeline}
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
              timeline={timeline}
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
            timeline={timeline}
            expanded_width={500}
            participants={participants}
            summoner={summoner}
            match_id={match.id}
          />
        </div>
        {mypart && (
          <div className="my-2">
            <RunePage
              mypart={mypart}
              participants={participants}
              match={match}
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
  const isWin = !!team[0]?.stats.win;
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
  const champions = useChampions();
  return (
    <div className="flex justify-around">
      {bans.map((ban, key) => {
        const url = mediaUrl(champions[ban.champion_id]?.image?.file_40);
        return (
          <>
            {!!url && (
              <Image
                alt={champions[ban.champion_id]?.name || ""}
                key={key}
                src={url}
                height={40}
                width={40}
              />
            )}
          </>
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
  const { region, searchName } = useRouter().query as {
    region: string;
    searchName: string;
  };
  const summoner = useSummoner({ region, name: searchName }).data;
  const name = part.summoner_name.split(/\s+/).join(" ");
  return (
    <div
      className={clsx("flex rounded p-2", {
        "bg-white/10 shadow-md": summoner?.puuid === part.puuid,
      })}
    >
      <div className="my-auto flex h-full flex-col">
        <div className="text-sm font-bold">
          <Link href={profileRoute({ region, name })}>{name}</Link>
        </div>
        <div className="flex">
          <div className="my-auto h-full">
            <ChampionClump part={part} />
          </div>
          <div className="my-auto ml-2 h-full">
            <ItemClump
              part={part}
              version={{ major: match.major, minor: match.minor }}
            />
          </div>
        </div>
      </div>
      <div className="my-auto ml-2 h-full">
        <StatClump part={part} match={match} />
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
  const rank = convertTier(part.tier) + convertRank(part.rank);
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
      <div title={`Impact Score: ${format(part.impact || 0, "0.00")}`}>
        {part.impact_rank === 1 ? (
          <div className="mt-1 rounded bg-yellow-600">MVP</div>
        ) : (
          <div>
            {format(part?.impact || 0, "0.00")}{" "}
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
  const { region, searchName, match } = context.query as {
    region: string;
    searchName: string;
    match: string;
  };
  const meta = await api.general.getMatchMetaData({
    name: searchName,
    region,
    matchId: match,
  });
  return {
    props: {
      meta,
    },
  };
}
