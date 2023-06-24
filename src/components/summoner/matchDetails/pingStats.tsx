import { mediaUrl } from "@/components/utils";
import { useBasicChampions } from "@/hooks";
import clsx from "clsx";
import Image from "next/image";
import { useState } from "react";
import type { AppendParticipant } from "../rankParticipants";

export function PingStats({
  mypart,
  participants,
}: {
  mypart: AppendParticipant;
  participants: AppendParticipant[];
}) {
  const [selected, setSelected] = useState(mypart._id);
  const part = participants.filter((x) => x._id === selected)[0];

  let total = 0;
  if (part) {
    total =
      part.stats.bait_pings +
      part.stats.hold_pings +
      part.stats.push_pings +
      part.stats.basic_pings +
      part.stats.all_in_pings +
      part.stats.danger_pings +
      part.stats.command_pings +
      part.stats.get_back_pings +
      part.stats.assist_me_pings +
      part.stats.on_my_way_pings +
      part.stats.need_vision_pings +
      part.stats.enemy_vision_pings +
      part.stats.enemy_missing_pings +
      part.stats.vision_cleared_pings;
  }

  return (
    <div className="flex">
      <ChampionSelection
        selected={selected}
        participants={participants}
        onClick={(partId: number) => {
          setSelected(partId);
        }}
      />
      {part && (
        <div className="ml-2">
          <div className="font-bold underline">{part.summoner_name}</div>
          <div className="text-right">
            <div className="grid grid-cols-2">
              <div>Total Pings:</div>
              <div>{total}</div>
              <div>Bait:</div>
              <div>{part.stats.bait_pings}</div>
              <div>Hold:</div>
              <div>{part.stats.hold_pings}</div>
              <div>Push:</div>
              <div>{part.stats.push_pings}</div>
              <div>Basic:</div>
              <div>{part.stats.basic_pings}</div>
              <div>All In:</div>
              <div>{part.stats.all_in_pings}</div>
              <div>Danger:</div>
              <div>{part.stats.danger_pings}</div>
              <div>Command:</div>
              <div>{part.stats.command_pings}</div>
              <div>Get Back:</div>
              <div>{part.stats.get_back_pings}</div>
              <div>Assist Me:</div>
              <div>{part.stats.assist_me_pings}</div>
              <div>On My Way:</div>
              <div>{part.stats.on_my_way_pings}</div>
              <div>Need Vision:</div>
              <div>{part.stats.need_vision_pings}</div>
              <div>Enemy Vision:</div>
              <div>{part.stats.enemy_vision_pings}</div>
              <div>Enemy Missing:</div>
              <div>{part.stats.enemy_missing_pings}</div>
              <div>Vision Cleared:</div>
              <div>{part.stats.vision_cleared_pings}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChampionSelection({
  selected,
  participants,
  onClick,
  className = "",
}: {
  selected: number;
  participants: AppendParticipant[];
  onClick: (participantId: number) => void;
  className?: string;
}) {
  const champions = useBasicChampions();
  return (
    <div className={className}>
      <div className="flex h-full flex-col justify-around">
        {participants.map((part) => {
          if (!champions[part.champion_id]?.image?.file_40) {
            return null
          }
          return (
            <div key={part._id}>
              <Image
                role="button"
                tabIndex={1}
                className={clsx("my-1 hover:cursor-pointer", {
                  "border-2 border-solid border-white": selected === part._id,
                  "opacity-60": selected !== part._id,
                })}
                onClick={() => onClick(part._id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onClick(part._id);
                  }
                }}
                alt={champions[part.champion_id]?.name || ""}
                src={mediaUrl(champions[part.champion_id]?.image?.file_40)}
                width={30}
                height={30}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
