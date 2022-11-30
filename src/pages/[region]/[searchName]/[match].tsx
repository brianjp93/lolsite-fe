import Skeleton from "@/components/general/skeleton";
import { useMatch, useParticipants, useTimeline } from "@/hooks";
import { useRouter } from "next/router";
import type { SimpleMatchType } from "@/external/types";
import Orbit from "@/components/general/spinner";
import type { AppendParticipant } from "@/components/summoner/rankParticipants";
import Link from "next/link";
import { profileRoute } from ".";
import type { FrameType } from "@/external/iotypes/match";
import {StringParam, useQueryParam, withDefault} from "use-query-params";

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
  const [returnPath,] = useQueryParam('returnPath', withDefault(StringParam, ''))
  const matchQuery = useMatch(matchId);
  const match = matchQuery.data;
  const participantsQuery = useParticipants(matchId);
  const participants = participantsQuery.data;
  const timelineQuery = useTimeline({ matchId });

  return (
    <Skeleton topPad={0}>
      <div className="flex">
        <Link href={returnPath ? returnPath: profileRoute({ region, name: searchName })}>
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
}: {
  match: SimpleMatchType;
  participants: AppendParticipant[];
  timeline?: FrameType[];
}) {
  return <div>{match._id}</div>;
}
