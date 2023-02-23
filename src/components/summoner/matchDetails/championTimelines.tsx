import { useState, useCallback, useMemo } from "react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useChampions } from "@/hooks";
import numeral from "numeral";
import type {
  SummonerType,
  FrameType,
  ParticipantFrameType,
} from "@/external/types";
import { useTimelineIndex } from "@/stores";
import type { AppendParticipant } from "../rankParticipants";
import { getMyPart, mediaUrl } from "@/components/utils";
import Image from "next/image";

type GraphType =
  | "total_gold"
  | "cs"
  | "xp"
  | "level"
  | "total_damage_done_to_champions"
  | "time_enemy_spent_controlled"
  | "gold_per_second";
interface AugmentedParticipantFrame extends ParticipantFrameType {
  cs: number;
}
interface AugmentedFrameType extends FrameType {
  participantframes: AugmentedParticipantFrame[];
}

export function ChampionTimelinesInner({
  matchId,
  summoner,
  participants,
  timeline,
  expanded_width,
}: {
  matchId: string;
  summoner: SummonerType;
  participants: AppendParticipant[];
  timeline: FrameType[];
  expanded_width: number;
}) {
  const my_part = getMyPart(participants, summoner.puuid);
  const [participant_selection, setParticipantSelection] = useState(
    participants.map((item) => item._id)
  );
  const [graph_type, setGraphType] = useState<GraphType>("total_gold");
  const champions = useChampions();
  const [timelineIndex, setTimelineIndex] = useTimelineIndex(matchId);

  const image_width = 30;
  const usable_width = expanded_width - 30;
  const available_width = usable_width - participants.length * image_width;
  const padding_pixels = available_width / participants.length;
  participants = useMemo(() => {
    return [
      ...participants.filter((participant) => participant.team_id === 100),
      ...participants.filter((participant) => participant.team_id === 200),
    ];
  }, [participants]);
  const participant_ids = participants.map(
    (participant: AppendParticipant) => participant._id
  );
  const colors = [
    "#d94630",
    "#d98d30",
    "#d9d330",
    "#90d930",
    "#3ca668",
    "#3ca69a",
    "#3c71a6",
    "#545acc",
    "#8c4fd6",
    "#eb80d6",
    "#d74da0",
    "#994352",
  ];

  const getGraphBubbleInput = (
    _type: GraphType,
    displayName?: string,
    tooltip?: string
  ) => {
    return (
      <div>
        <label data-tip={tooltip} htmlFor={`${_type}-champion-graph`}>
          <input
            className="inline mr-1"
            id={`${_type}-champion-graph`}
            onChange={() => setGraphType(_type)}
            type="radio"
            checked={graph_type === _type}
          />
          <span>{displayName || _type}</span>
        </label>
      </div>
    );
  };

  return (
    <div>
      <div className="flex justify-center">
        {participants.map((participant, index) => {
          return (
            <ChampionImage
              key={`${participant._id}-champion-image`}
              is_me={participant._id === my_part?._id}
              color={colors[index]}
              is_selected={participant_selection.indexOf(participant._id) >= 0}
              image_width={image_width}
              participant={participant}
              padding_pixels={padding_pixels}
              handleClick={() => {
                let new_selection = [...participant_selection];
                if (participant_selection.indexOf(participant._id) >= 0) {
                  new_selection = new_selection.filter(
                    (id) => id !== participant._id
                  );
                } else {
                  new_selection.push(participant._id);
                }
                setParticipantSelection(new_selection);
              }}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2" style={{ marginLeft: 0, marginRight: 0 }}>
        <div className="w-full m-1">
          <button
            onClick={useCallback(() => setParticipantSelection([]), [])}
            className="btn btn-default w-full mr-1"
          >
            Clear All
          </button>
        </div>
        <div className="w-full m-1">
          <button
            onClick={useCallback(() => {
              const parts = participants.map((part) => part._id);
              setParticipantSelection(parts);
            }, [participants])}
            className="btn btn-default w-full ml-1"
          >
            Select All
          </button>
        </div>
      </div>

      <div>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            onMouseMove={(props) => {
              if (props.activeTooltipIndex !== undefined) {
                const new_timeline_index = props.activeTooltipIndex;
                setTimelineIndex(new_timeline_index);
              }
            }}
            margin={{
              left: -10,
              right: 20,
            }}
            data={timeline}
          >
            <CartesianGrid
              vertical={false}
              stroke="#777"
              strokeDasharray="4 4"
            />

            <XAxis
              hide={false}
              tickFormatter={(tickItem) => {
                const m = Math.round(tickItem / 1000 / 60);
                return `${m}m`;
              }}
              dataKey="timestamp"
            />

            <YAxis
              yAxisId="left"
              orientation="left"
              tickFormatter={(tick) => {
                return numeral(tick).format("0a");
              }}
            />

            {timelineIndex && (
              <ReferenceLine
                yAxisId="left"
                x={timeline[timelineIndex]?.timestamp}
                stroke="white"
                strokeWidth={2}
              />
            )}

            {participant_selection.map((id) => {
              const stroke = colors[participant_ids.indexOf(id)];
              const stroke_width = id !== my_part?._id ? 1 : 3;
              const stroke_type =
                graph_type === "level" ? "stepAfter" : "monotone";
              const part = getParticipant(participants, id);
              if (!part) {
                return null;
              }
              return (
                <Line
                  name={champions[part.champion_id]?.name}
                  key={`${id}-line-chart`}
                  isAnimationActive={false}
                  yAxisId="left"
                  type={stroke_type}
                  dot={false}
                  dataKey={(frame: AugmentedFrameType) => {
                    for (const part of frame.participantframes) {
                      if (part.participant_id === id) {
                        return part[graph_type];
                      }
                    }
                    return null;
                  }}
                  stroke={stroke}
                  strokeWidth={stroke_width}
                />
              );
            })}
            <Tooltip
              itemSorter={(item: any) => -item.value}
              wrapperStyle={{ zIndex: 10 }}
              formatter={(value: any) => {
                let output;
                if (graph_type === "total_gold") {
                  output = `${numeral(value).format("0,0")} gold`;
                } else {
                  output = value;
                }
                return output;
              }}
              labelFormatter={(label) => {
                let m = "";
                if (typeof label === "number") {
                  m = Math.round(label / 1000 / 60).toString();
                }
                return `${m}m`;
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3" style={{ marginLeft: 20, marginRight: 15 }}>
        {getGraphBubbleInput("total_gold", "Gold")}
        {getGraphBubbleInput("cs", "CS")}
        {getGraphBubbleInput("xp", "XP")}
        {getGraphBubbleInput("level", "Level")}
        {getGraphBubbleInput("total_damage_done_to_champions", "Champ DMG")}
        {getGraphBubbleInput(
          "time_enemy_spent_controlled",
          "CC Time",
          "I have no idea what the units of this is supposed to be."
        )}
        {getGraphBubbleInput(
          "gold_per_second",
          "Gold/Sec",
          "Passive gold generation from support items?"
        )}
      </div>
    </div>
  );
}

function getParticipant(participants: AppendParticipant[], id: number) {
  for (const part of participants) {
    if (part._id === id) {
      return part;
    }
  }
  return null;
}

function ChampionImage(props: any) {
  const champions = useChampions();
  let image_style: any = {
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: props.color,
    cursor: "pointer",
    width: 30,
    height: 30,
  };
  if (!props.is_selected) {
    image_style = {
      ...image_style,
      opacity: 0.3,
    };
  }

  const vert_align: React.CSSProperties = {};
  if (props.participant.champion?.image?.image_url) {
    vert_align.verticalAlign = "top";
  }

  return (
    <div style={{ padding: "0px 10px" }}>
      {mediaUrl(champions[props.participant.champion_id]?.image.image_url || '') ===
        "" && (
        <div onClick={props.handleClick} style={{ ...image_style }}>
          NA
        </div>
      )}
      {champions?.[props.participant?.champion_id]?.image?.image_url && (
        <Image
          role="button"
          tabIndex={1}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              props.handleClick();
            }
          }}
          onClick={props.handleClick}
          height={30}
          width={30}
          style={{ ...image_style }}
          src={mediaUrl(
            champions?.[props.participant.champion_id]?.image?.image_url || ''
          )}
          alt={
            champions?.[props.participant.champion_id]?.name || "Champion Image"
          }
        />
      )}
    </div>
  );
}
