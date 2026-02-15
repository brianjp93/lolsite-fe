import { mediaUrl } from "@/components/utils";
import type { FullParticipantType } from "@/external/types";
import { useBasicChampions } from "@/hooks";
import clsx from "clsx";
import Image from "next/image";
import { useState, useMemo } from "react";

const PING_TYPES = [
  { key: "on_my_way_pings", label: "On My Way", color: "bg-emerald-500" },
  { key: "enemy_missing_pings", label: "Enemy Missing", color: "bg-rose-400" },
  { key: "danger_pings", label: "Danger", color: "bg-red-500" },
  { key: "assist_me_pings", label: "Assist Me", color: "bg-sky-400" },
  { key: "command_pings", label: "Command", color: "bg-amber-400" },
  { key: "get_back_pings", label: "Get Back", color: "bg-orange-400" },
  { key: "need_vision_pings", label: "Need Vision", color: "bg-violet-400" },
  { key: "enemy_vision_pings", label: "Enemy Vision", color: "bg-pink-400" },
  { key: "vision_cleared_pings", label: "Vision Cleared", color: "bg-teal-400" },
  { key: "push_pings", label: "Push", color: "bg-cyan-400" },
  { key: "all_in_pings", label: "All In", color: "bg-red-400" },
  { key: "hold_pings", label: "Hold", color: "bg-yellow-400" },
  { key: "bait_pings", label: "Bait", color: "bg-lime-400" },
  { key: "basic_pings", label: "Basic", color: "bg-zinc-400" },
] as const;

export function PingStats({
  mypart,
  participants,
}: {
  mypart: FullParticipantType;
  participants: FullParticipantType[];
}) {
  const [selected, setSelected] = useState(mypart._id);
  const part = participants.find((x) => x._id === selected);

  const { total, maxPing } = useMemo(() => {
    if (!part) return { total: 0, maxPing: 0 };
    let sum = 0;
    let max = 0;
    for (const { key } of PING_TYPES) {
      const val = part.stats[key] as number;
      sum += val;
      if (val > max) max = val;
    }
    return { total: sum, maxPing: max };
  }, [part]);

  return (
    <div className="flex gap-3">
      <ChampionSelection
        selected={selected}
        participants={participants}
        onClick={(partId: number) => {
          setSelected(partId);
        }}
      />
      {part && (
        <div className="min-w-[260px]">
          <div className="mb-2 flex items-center justify-between border-b border-zinc-600 pb-2">
            <span className="text-sm font-semibold text-zinc-200">{part.summoner_name}</span>
            <span className="rounded bg-zinc-700 px-2 py-0.5 text-xs font-bold text-zinc-100">
              {total} pings
            </span>
          </div>
          <div className="space-y-1">
            {PING_TYPES.map(({ key, label, color }) => {
              const value = part.stats[key] as number;
              const pct = maxPing > 0 ? (value / maxPing) * 100 : 0;
              return (
                <div key={key} className="group flex items-center gap-2 text-xs">
                  <span className="w-[100px] shrink-0 text-right text-zinc-400">{label}</span>
                  <div className="relative h-4 flex-1 overflow-hidden rounded-sm bg-zinc-800">
                    {value > 0 && (
                      <div
                        className={clsx("h-full rounded-sm transition-all", color)}
                        style={{ width: `${pct}%`, minWidth: "4px", opacity: 0.75 }}
                      />
                    )}
                  </div>
                  <span
                    className={clsx("w-5 text-right tabular-nums", {
                      "font-medium text-zinc-200": value > 0,
                      "text-zinc-600": value === 0,
                    })}
                  >
                    {value}
                  </span>
                </div>
              );
            })}
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
  participants: FullParticipantType[];
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
                className={clsx("my-0.5 rounded-md hover:cursor-pointer transition-all", {
                  "ring-2 ring-sky-400 brightness-110": selected === part._id,
                  "opacity-50 hover:opacity-80": selected !== part._id,
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
