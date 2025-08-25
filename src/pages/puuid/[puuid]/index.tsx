import Skeleton from "@/components/general/skeleton";
import { useRouter } from "next/router";
import { useSummonerByPuuid } from "@/hooks";
import { useEffect } from "react";
import { profileRoute } from "@/routes";

// used as a redirect page so we can link directly to a puuid
export default function PuuidPage() {
  const router = useRouter();
  const { puuid } = router.query as { puuid: string };
  const summonerQuery = useSummonerByPuuid({ puuid });
  const summoner = summonerQuery.data;

  useEffect(() => {
    if (summoner) {
      const url = profileRoute({
        region: summoner.region,
        riotIdName: summoner.riot_id_name,
        riotIdTagline: summoner.riot_id_tagline,
      });
      router.replace(url);
    }
  }, [summoner, router]);
  return (
    <Skeleton>
      {summonerQuery.isLoading && <div>Loading...</div>}
      {summonerQuery.isError && <div>An error has occurred.</div>}
    </Skeleton>
  );
}
