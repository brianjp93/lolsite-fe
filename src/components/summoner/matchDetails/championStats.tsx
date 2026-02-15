import { useState, useMemo, useCallback} from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import numeral from "numeral";
import { useBasicChampions } from "@/hooks";
import type { FullParticipantType } from "@/external/types";
import Image from "next/image";
import { mediaUrl } from "@/components/utils";
import clsx from "clsx";

const CONVERT = {
  total_damage_dealt_to_champions: "total",
  damage_self_mitigated: "self mitigated",
  physical_damage_dealt_to_champions: "physical dealt",
  magic_damage_dealt_to_champions: "magic dealt",
  true_damage_dealt_to_champions: "true dealt",
  damage_dealt_to_turrets: "turret damage",
  damage_dealt_to_objectives: "objective damage",
  total_heal: "healing",
  total_damage_taken: "damage taken",
  vision_score: "vision score",
  wards_placed: "wards placed",
  wards_killed: "wards killed",
  total_heals_on_teammates: "Healing done to teammates",
  total_damage_shielded_on_teammates: "Damage mitigated with shields on teammates",
  vision_wards_bought_in_game: "control wards",
  dpd: "dmg / death",
  dtpd: "dmg taken / death",
  time_ccing_others: "time ccing others",

  cs: "total cs",
  cspm: "cs / min",
};

export function StatOverview({
  participants,
  match,
  mypart,
}: {
  participants: FullParticipantType[];
  match: { _id: string; game_duration: number, id: number };
  mypart: FullParticipantType;
}) {
  const [selected, setSelected] = useState<Set<keyof typeof CONVERT>>(
    new Set(["total_damage_dealt_to_champions"])
  );
  const champions = useBasicChampions();

  const toggle = (value: keyof typeof CONVERT) => {
    const select = new Set(selected);
    select.clear();
    select.add(value);
    setSelected(select);
  };

  const team100 = useMemo(
    () => participants.filter((item) => item.team_id === 100),
    [participants]
  );
  const team200 = useMemo(
    () => participants.filter((item) => item.team_id === 200),
    [participants]
  );

  const getKP = useCallback(
    (team_id: number, kills: number, assists: number) => {
      const parts = team_id === 100 ? team100 : team200;
      const total = parts.map((x) => x.stats.kills).reduce((a, b) => a + b, 0);
      return ((kills + assists) / total) * 100;
    },
    [team100, team200]
  );

  const data = useMemo(() => {
    return [...team100, ...team200].map((x) => {
      return {
        ...x,
        ...x.stats,
        dpm: x.stats.total_damage_dealt_to_champions / match.game_duration / 60,
        dpg: x.stats.total_damage_dealt_to_champions / x.stats.gold_earned,
        kp: getKP(x.team_id, x.stats.kills, x.stats.assists),
        dpd: x.stats.total_damage_dealt_to_champions / (x.stats.deaths || 1),
        dtpd: x.stats.total_damage_taken / (x.stats.deaths || 1),
        cs: x.stats.total_minions_killed + x.stats.neutral_minions_killed,
        cspm:
          (x.stats.total_minions_killed + x.stats.neutral_minions_killed) /
          match.game_duration /
          60,
      };
    });
  }, [team100, team200, getKP, match.game_duration]);

  const statButton = (title: string, tooltip: string, value: string) => {
    const isActive = selected.has(value as keyof typeof CONVERT);
    return (
      <button
        key={value}
        title={tooltip}
        onClick={() => toggle(value as keyof typeof CONVERT)}
        className={clsx(
          "cursor-pointer rounded border px-1.5 py-0.5 text-left text-[11px] transition-colors",
          isActive
            ? "border-sky-500/50 bg-sky-900/40 font-medium text-sky-200"
            : "border-zinc-700/50 bg-zinc-800/40 text-zinc-400 hover:border-zinc-600 hover:bg-zinc-700/50 hover:text-zinc-200"
        )}
      >
        {title}
      </button>
    );
  };

  const sectionHeader = (title: string) => (
    <div className="mt-2 mb-1 border-b border-zinc-700/50 pb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 first:mt-0">
      {title}
    </div>
  );

  const parts = [...team100, ...team200];
  const bargraph_height = 420;
  return (
    <div className="flex items-start gap-1">
      <div className="quiet-scroll flex h-[420px] w-[120px] shrink-0 flex-col overflow-y-auto pr-1">
        {sectionHeader("Champion Damage")}
        {statButton("Total", "Total Damage to Champions", "total_damage_dealt_to_champions")}
        {statButton("Dmg / Min", "Damage Per Minute", "dpm")}
        {statButton("Dmg / Gold", "Damage Per Gold", "dpg")}
        {statButton("Dmg / Death", "Damage Per Death", "dpd")}
        {statButton("KP", "Kill Participation", "kp")}
        {statButton("Physical", "Physical Damage to Champions", "physical_damage_dealt_to_champions")}
        {statButton("Magic", "Magic Damage to Champions", "magic_damage_dealt_to_champions")}
        {statButton("True", "True Damage to Champions", "true_damage_dealt_to_champions")}
        {statButton("CC Time", "Time CCing Others", "time_ccing_others")}

        {sectionHeader("Structure Damage")}
        {statButton("Turrets", "Damage Dealt to Turrets", "damage_dealt_to_turrets")}
        {statButton("Objectives", "Damage Dealt to Objectives", "damage_dealt_to_objectives")}

        {sectionHeader("Sustain")}
        {statButton("Healing", "Healing Done", "total_heal")}
        {statButton("Team Healing", "Teammate Healing", "total_heals_on_teammates")}
        {statButton("Team Shielding", "Damage mitigated on teammates with shields", "total_damage_shielded_on_teammates")}
        {statButton("Damage Taken", "Total Damage Taken", "total_damage_taken")}
        {statButton("Dmg / Death", "Damage Taken Per Death", "dtpd")}
        {statButton("Self Mitigated", "Damage Self Mitigated", "damage_self_mitigated")}

        {sectionHeader("Vision")}
        {statButton("Vision Score", "Vision Score", "vision_score")}
        {statButton("Wards Placed", "Wards Placed", "wards_placed")}
        {statButton("Wards Killed", "Wards Killed", "wards_killed")}
        {statButton("Control Wards", "# of Control Wards purchased", "vision_wards_bought_in_game")}

        {sectionHeader("Farming")}
        {statButton("Total CS", "Total CS", "cs")}
        {statButton("CS / Min", "CS Per Minute", "cspm")}
        {statButton("Ally JG CS", "Ally Jungle Minions Killed", "total_ally_jungle_minions_killed")}
        {statButton("Enemy JG CS", "Enemy Jungle Minions Killed", "total_enemy_jungle_minions_killed")}

        <div className="pb-16" />
      </div>

      <div className="relative">
        <div
          className="absolute z-10 flex flex-col"
          style={{
            top: 12,
            left: 0,
            marginTop: (10 - parts.length) * 2.6,
          }}
        >
          {parts.map((part) => {
            const h = (bargraph_height - 40) / parts.length;
            return (
              <div
                key={`${match._id}-${part._id}`}
                className="flex items-start"
                style={{ height: h }}
              >
                {champions?.[part.champion_id]?.image.file_40 ? (
                  <Image
                    title={part.summoner_name}
                    width={22}
                    height={22}
                    className="rounded"
                    src={mediaUrl(champions[part.champion_id]!.image.file_40)}
                    alt={champions[part.champion_id]?.name || "Champion"}
                  />
                ) : (
                  <div className="h-[22px] w-[22px] rounded border border-zinc-600" />
                )}
              </div>
            );
          })}
        </div>

        <div className="ml-7">
          <BarChart
            layout="vertical"
            width={500}
            height={bargraph_height}
            data={data}
          >
            <YAxis
              width={0}
              type="category"
              dataKey="summoner_name"
              interval={0}
              tickFormatter={() => ""}
            />
            <XAxis
              tickFormatter={(value) => {
                if (value.toString().indexOf(".") >= 0) {
                  return numeral(value).format("0,0.00");
                } else {
                  return numeral(value).format("0,0");
                }
              }}
              domain={[0, "dataMax"]}
              type="number"
            />
            <Tooltip
              formatter={(value: string, name: string) => {
                if (CONVERT[name as keyof typeof CONVERT]) {
                  name = CONVERT[name as keyof typeof CONVERT];
                }

                if (value.toString().indexOf(".") >= 0) {
                  value = numeral(value).format("0,0.00");
                } else {
                  value = numeral(value).format("0,0");
                }
                return [value, name];
              }}
            />
            {[...selected].map((key) => {
              return (
                <Bar key={`${key}-bar`} dataKey={key} radius={[0, 4, 4, 0]}>
                  {data.map((part) => {
                    let fill: string;
                    if (part.puuid === mypart.puuid) {
                      fill = "#7cb3d4";
                    } else if (part.team_id === mypart.team_id) {
                      fill = "#437296";
                    } else {
                      fill = "#b05656";
                    }
                    return (
                      <Cell
                        key={`${match.id}-${part._id}-cell`}
                        fill={fill}
                      />
                    );
                  })}
                </Bar>
              );
            })}
          </BarChart>
        </div>
      </div>
    </div>
  );
}
