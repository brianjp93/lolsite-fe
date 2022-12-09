import {type SummonerType} from "@/external/types";
import {useSummoner} from "@/hooks";
import Image from "next/image";
import {useRouter} from "next/router";

export function ProfileCard({className=""}: {className: string}) {
  const router = useRouter();
  const {
    searchName,
    region,
  } = router.query as { searchName: string; region: string };
  const summonerQ = useSummoner({region, name: searchName})
  const summoner = summonerQ.data
  if (!summoner) return null
  return (
  <div className={className}>
    <ProfileCardInner summoner={summoner} />
  </div>
  )
}

export function ProfileCardInner({summoner}: {summoner: SummonerType}) {
  return (
    <div className="flex">
      <div className="flex">
        <div>
          {summoner.name}
        </div>
      </div>
    </div>
  )
}
