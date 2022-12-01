import Skeleton from "@/components/general/skeleton";
import { useMatch, useParticipants, useSummoner, useTimeline } from "@/hooks";
import { useRouter } from "next/router";
import type { SimpleMatchType } from "@/external/types";
import Orbit from "@/components/general/spinner";
import type { AppendParticipant } from "@/components/summoner/rankParticipants";
import Link from "next/link";
import { profileRoute } from ".";
import type { FrameType } from "@/external/iotypes/match";
import { StringParam, useQueryParam, withDefault } from "use-query-params";
import { convertRank, convertTier, getTeam } from "@/components/utils";
import {
  ChampionClump,
  ItemClump,
  StatClump,
} from "@/components/summoner/matchCard";
import clsx from "clsx";
import numeral from "numeral";

export const matchRoute = (region: string, name: string, matchId: string) => {
  return `/${region}/${name}/${matchId}/`;
};

export default function Match() {
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

  return (
    <Skeleton topPad={0}>
      <div className="flex ml-10">
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
      {match && participants && (
        <InnerMatch
          match={match}
          participants={participants}
          timeline={timelineQuery.data}
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
}: {
  match: SimpleMatchType;
  participants: AppendParticipant[];
  timeline?: FrameType[];
}) {
  const team100 = getTeam(100, participants);
  const team200 = getTeam(200, participants);
  return (
    <div>
      <div className="flex justify-center">
        <div className="flex w-fit overflow-x-scroll rounded bg-zinc-800/40 p-2">
          <div className="min-w-fit pr-1">
            <TeamSide team={team100} match={match} />
          </div>
          <div className="my-auto rounded-full bg-gradient-to-r from-cyan-700 to-rose-700 p-3 font-bold">
            VS
          </div>
          <div className="min-w-fit pl-1">
            <TeamSide team={team200} match={match} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TeamSide({
  team,
  match,
}: {
  team: AppendParticipant[];
  match: SimpleMatchType;
}) {
  const isWin = !!team[0]?.stats.win;
  return (
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
            <ItemClump part={part} />
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
