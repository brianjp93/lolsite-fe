import { useMatchList, useSummoner } from "@/hooks";
import Orbit from "../general/spinner";
import MatchCard from "./matchCard";

export function SummonerSummary({
  name,
  region,
}: {
  name: string;
  region: string;
}) {
  const query = useMatchList({
    name,
    region,
    start: 0,
    limit: 20,
    sync: true,
    queue: 420,
    onSuccess: () => undefined,
    onError: () => undefined,
  });
  const summonerQ = useSummoner({ region, name });
  const summoner = summonerQ.data;
  const matches = query.data || [];
  if (query.isLoading) {
    return <Orbit />;
  }
  if (matches.length === 0) {
    return <div>No matches found</div>;
  }
  if (!summoner) {
    return <div>No summoner found.</div>;
  }
  return (
    <>
      <div>
        {matches.map((match) => {
          return (
            <div key={match.id}>
              <MatchCard match={match} summoner={summoner} />
            </div>
          );
        })}
      </div>
    </>
  );
}
