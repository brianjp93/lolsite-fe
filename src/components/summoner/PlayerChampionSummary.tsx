import {usePlayerSummary} from "@/hooks"

export function PlayerChampionSummary({puuid}: {puuid: string}) {
  const query = usePlayerSummary({puuid})
  const summary = query.data
  return (
    <div>
    </div>
  )
}
