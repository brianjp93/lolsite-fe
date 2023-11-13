import api from "@/external/api/api";
import {useQuery} from "@tanstack/react-query";
import {useRouter} from "next/router";

export default function MatchSummary() {
  const router = useRouter();
  const {
    match: matchId,
  } = router.query as { searchName: string; match: string; region: string };
  const query = useQuery(['matchSummary', matchId], () => {
    return api.match.getMatchSummary(matchId)
  },
  {
    retry: false,
    enabled: !!matchId,
    refetchInterval: (data) => {
      if (!data || data.status === "r") {
        return 3000
      }
      return false
    },
    staleTime: 10000000,
  })
  return (
    <div className="h-screen">
      {query.isLoading && "loading..."}
      {query.data && <>
        <textarea readOnly value={query.data.content} className="w-full h-full bg-black p-8" />
      </>}
    </div>
  )
}
