import { useState, useMemo, useCallback} from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import numeral from "numeral";
import { useBasicChampions } from "@/hooks";
import type { FullParticipantType } from "@/external/types";
import Image from "next/image";
import { mediaUrl } from "@/components/utils";
import type { AppendParticipant } from "../rankParticipants";

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
  participants: AppendParticipant[];
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

  const getBarGraphStat = (title: string, tooltip: string, value: string) => {
    return (
      <label
        data-tip={tooltip}
        className="flex"
        htmlFor={`${value}-${match._id}`}
      >
        <input
          value={value}
          checked={selected.has(value as keyof typeof CONVERT)}
          onChange={() => toggle(value as keyof typeof CONVERT)}
          id={`${value}-${match._id}`}
          type="checkbox"
        />
        <div className="text-xs text-gray-200 ml-1">{title}</div>
      </label>
    );
  };

  const parts = [...team100, ...team200];
  const bargraph_height = 420;
  return (
    <div className="relative min-w-fit ml-4">
      <div
        className="quiet-scroll inline-block overflow-y-auto"
        style={{
          height: 420,
          width: 115,
        }}
      >
        <div className="flex flex-col">
          <div style={{ fontSize: "small" }}>
            Damage to <br />
            Champions
            <hr />
          </div>

          {getBarGraphStat(
            "Total",
            "Total Damage to Champions",
            "total_damage_dealt_to_champions"
          )}
          {getBarGraphStat("Dmg / Min", "Damage Per Minute", "dpm")}
          {getBarGraphStat("Dmg / Gold", "Damage Per Gold", "dpg")}
          {getBarGraphStat("Dmg / Death", "Damage Per Death", "dpd")}
          {getBarGraphStat("KP", "Kill Participation", "kp")}
          {getBarGraphStat(
            "Physical",
            "Physical Damage to Champions",
            "physical_damage_dealt_to_champions"
          )}
          {getBarGraphStat(
            "Magic",
            "Magic Damage to Champions",
            "magic_damage_dealt_to_champions"
          )}
          {getBarGraphStat(
            "True",
            "True Damage to Champions",
            "true_damage_dealt_to_champions"
          )}
          {getBarGraphStat("CC Time", "Time CCing Others", "time_ccing_others")}
        </div>

        <div>
          <span style={{ fontSize: "small" }}>
            Damage to <br />
            Structures
            <hr />
          </span>

          {getBarGraphStat(
            "Turrets",
            "Damage Dealt to Turrets",
            "damage_dealt_to_turrets"
          )}
          {getBarGraphStat(
            "Objectives",
            "Damage Dealt to Objectives",
            "damage_dealt_to_objectives"
          )}
        </div>

        <div>
          <span style={{ fontSize: "small" }}>
            Damage Taken <br />
            and Healed
            <hr />
          </span>

          {getBarGraphStat("Healing Done", "Healing Done", "total_heal")}
          {getBarGraphStat(
            "Damage Taken",
            "Total Damage Taken",
            "total_damage_taken"
          )}
          {getBarGraphStat("Dmg / Death", "Damage Taken Per Death", "dtpd")}
          {getBarGraphStat(
            "Self Mitigated",
            "Damage Self Mitigated",
            "damage_self_mitigated"
          )}
        </div>

        <div>
          <span style={{ fontSize: "small" }}>
            Vision
            <hr />
          </span>

          {getBarGraphStat("Vision Score", "Vision Score", "vision_score")}
          {getBarGraphStat("Wards Placed", "Wards Placed", "wards_placed")}
          {getBarGraphStat("Wards Killed", "Wards Killed", "wards_killed")}
          {getBarGraphStat(
            "Control Wards",
            "# of Control Wards purchased",
            "vision_wards_bought_in_game"
          )}
        </div>

        <div>
          <span style={{ fontSize: "small" }}>
            Minions and <br />
            Monsters
            <hr />
          </span>

          {getBarGraphStat("Total CS", "Total CS", "cs")}
          {getBarGraphStat("CS / Min", "CS Per Minute", "cspm")}
          {getBarGraphStat("Ally JG CS", "Ally Jungle Minions Killed", "total_ally_jungle_minions_killed")}
          {getBarGraphStat("Enemy JG CS", "Enemy Jungle Minions Killed", "total_enemy_jungle_minions_killed")}
        </div>

        <div style={{ marginBottom: 80 }}></div>
      </div>

      <div
        style={{
          position: "absolute",
          top: 12,
          left: 140,
          zIndex: 5,
          marginTop: (10 - parts.length) * 2.6,
        }}
      >
        {parts.map((part) => {
          const heights = (bargraph_height - 40) / parts.length;
          return (
            <div
              key={`${match._id}-${part._id}`}
              style={{ height: heights, width: 30 }}
            >
              {champions?.[part.champion_id]?.image.file_30 ?
                <Image
                  title={part.summoner_name}
                  width={20}
                  height={20}
                  src={mediaUrl(champions?.[part.champion_id]?.image.file_30)}
                  alt={champions?.[part.champion_id]?.name || "Champion Image"}
                /> :
                <div className="w-[20px] h-[20px] border border-white"/>
              }
            </div>
          );
        })}
      </div>

      <div style={{ display: "inline-block", marginLeft: 50 }}>
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
              <Bar key={`${key}-bar`} dataKey={key}>
                {data.map((part) => {
                  if (part.puuid === mypart.puuid) {
                    return (
                      <Cell
                        key={`${match.id}-${part._id}-cell`}
                        fill="#a7bed0"
                      />
                    );
                  } else if (part.team_id === mypart.team_id) {
                    return (
                      <Cell
                        key={`${match.id}-${part._id}-cell`}
                        fill="#437296"
                      />
                    );
                  } else if (part.team_id !== mypart.team_id) {
                    return (
                      <Cell
                        key={`${match.id}-${part._id}-cell`}
                        fill="#954e4e"
                      />
                    );
                  } else {
                    return (
                      <Cell
                        key={`${match.id}-${part._id}-cell`}
                        fill="#5e7ca7"
                      />
                    );
                  }
                })}
              </Bar>
            );
          })}
        </BarChart>
      </div>
    </div>
  );
}
