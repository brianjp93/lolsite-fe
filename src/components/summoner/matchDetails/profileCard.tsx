import { mediaUrl } from "@/components/utils";
import type { PositionType } from "@/external/iotypes/player";
import type { SummonerType } from "@/external/types";
import { usePositions, useSummoner } from "@/hooks";
import Image from "next/image";
import { useRouter } from "next/router";

const QUEUE_CONVERT: Record<string, string> = {
  RANKED_SOLO_5x5: 'Solo/Duo',
  RANKED_FLEX_SR: '5v5 Flex',
  RANKED_FLEX_TT: '3v3 Flex',
  RANKED_TFT: 'TFT',
  RANKED_TFT_DOUBLE_UP: 'TFT Double Up',
} as const

export function ProfileCard({ className = "" }: { className: string }) {
  const router = useRouter();
  const { searchName, region } = router.query as {
    searchName: string;
    region: string;
  };
  const summonerQ = useSummoner({ region, name: searchName });
  const summoner = summonerQ.data;
  const positionQ = usePositions({ summoner_id: summoner?._id || "", region });
  const positions = positionQ.data;
  if (!summoner) return null;
  return (
    <div className={className}>
      <ProfileCardInner summoner={summoner} positions={positions} />
    </div>
  );
}

export function ProfileCardInner({
  summoner,
  positions = [],
}: {
  summoner: SummonerType;
  positions?: PositionType[];
}) {
  return (
    <div className="flex max-w-fit flex-col rounded bg-zinc-900 p-4 shadow-lg">
      <div className="flex">
        <div className="relative w-fit">
          <Image
            src={mediaUrl(summoner.profile_icon)}
            alt={`Summoner Icon: ${summoner.profile_icon_id}`}
            width={40}
            height={40}
            className="rounded"
          />
          <div className="absolute bottom-[-7px] flex w-full">
            <div className="mx-auto rounded-md bg-zinc-200 px-1 text-xs font-bold text-gray-900">
              {summoner.summoner_level}
            </div>
          </div>
        </div>
        <div className="ml-2 font-bold underline">{summoner.name}</div>
      </div>
      <div className="mt-2">
      {positions.map((x) => {
        const queue = QUEUE_CONVERT[x.queue_type] || x.queue_type
        return (
          <div key={x.id}>
            <div className="font-bold inline">{queue}</div>: {x.tier} {x.rank}
          </div>
        );
      })}
      </div>
    </div>
  );
}
