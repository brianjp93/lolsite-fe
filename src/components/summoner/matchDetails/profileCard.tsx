import { mediaUrl } from "@/components/utils";
import type { NameChangeType, PositionType } from "@/external/iotypes/player";
import type { SummonerType } from "@/external/types";
import { useNameChanges, usePositions, useSummoner } from "@/hooks";
import Image from "next/image";
import { useRouter } from "next/router";
import { Popover } from "react-tiny-popover";
import { useState } from "react";
import { QUEUE_CONVERT } from "@/utils/constants";


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
  const nameChangeQuery = useNameChanges(summoner?.id || 0);
  const nameChanges = nameChangeQuery.data || [];
  if (!summoner) return null;
  return (
    <div className={className}>
      <ProfileCardInner
        summoner={summoner}
        positions={positions}
        nameChanges={nameChanges}
      />
    </div>
  );
}

export function ProfileCardInner({
  summoner,
  positions = [],
  nameChanges = [],
}: {
  summoner: SummonerType;
  positions?: PositionType[];
  nameChanges?: NameChangeType[];
}) {
  const [isNameChangeOpen, setIsNameChangeOpen] = useState(false);

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
        <div
          onClick={() => setIsNameChangeOpen((x) => !x)}
          className="ml-2 font-bold underline cursor-pointer"
        >
          <Popover
            isOpen={isNameChangeOpen}
            positions={["bottom"]}
            containerStyle={{ zIndex: "11" }}
            content={
              <div>
                <h1 className="underline">Old Names</h1>
                {nameChanges.map((item, key) => {
                  return <div key={key}>{item.old_name}</div>;
                })}
              </div>
            }
          >
            <div>{summoner.name}</div>
          </Popover>
        </div>
      </div>
      <div className="mt-2">
        {positions.map((x) => {
          const queue = QUEUE_CONVERT[x.queue_type] || x.queue_type;
          return (
            <div key={x.id}>
              <div className="flex">
                <div className="mr-8">
                  <div className="inline font-bold">{queue}:</div>
                </div>
                <div className="ml-auto">
                  {x.tier} {x.rank} {x.league_points}LP
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
