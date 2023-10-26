import { useState, useEffect, useCallback } from "react";
import { BUILDINGS } from "@/utils/buildings";
import { useBasicChampions, useParticipants, useTimeline } from "@/hooks";
import { useTimelineIndex } from "@/stores";

import type {
  FrameType,
  FullParticipantType,
  BuildingKillEventType,
  ChampionKillEventType,
  EliteMonsterKillEventType,
  TurretPlateDestroyedEventType,
  VictimDamageType,
} from "@/external/types";
import Image from "next/image";
import { useRouter } from "next/router";
import { mediaUrl } from "@/components/utils";
import type { ValueOf } from "next/dist/shared/lib/constants";
import SWORD from "@/../public/gen/sword.svg";
import { Popover } from "react-tiny-popover";

function mapAssistName(name: string) {
  if (name.match(/sru.*minion/i)) {
    return "Minions";
  } else if (name.match(/sru.*turret/i)) {
    return "Tower";
  } else if (name.match(/sru.*red/i)) {
    return "Red Buff";
  } else if (name.match(/sru.*krug/i)) {
    return "Krugs";
  } else if (name.match(/sru.*dragon/i)) {
    return "Dragon";
  } else if (name.match(/sru.*razorbeak/i)) {
    return "Birds";
  } else if (name.match(/sru.*blue/i)) {
    return "Blue Buff";
  } else if (name.match(/sru.*wolf/i)) {
    return "Wolves";
  } else if (name.match(/sru.*gromp/i)) {
    return "Gromp";
  } else if (name.match(/sru.*rift.*herald/i)) {
    return "Rift Herald";
  } else if (name.match(/sru.*baron/i)) {
    return "Baron";
  }
  return name;
}

export function MapEvents() {
  const router = useRouter();
  const { match: matchId } = router.query as {
    searchName: string;
    match: string;
    region: string;
  };
  const timelineQ = useTimeline({ matchId });
  const timeline = timelineQ.data;
  const participantsQ = useParticipants(matchId);
  const participants = participantsQ.data;
  if (!timeline || !participants) return null;
  return (
    <MapEventsInner
      timeline={timeline}
      participants={participants}
      match={{ _id: matchId }}
    />
  );
}

export function MapEventsInner({
  match,
  participants,
  timeline,
}: {
  match: { _id: string };
  participants: FullParticipantType[];
  timeline: FrameType[];
}) {
  const [index, setIndex] = useState(0);
  const [buildings, setBuildings] = useState<typeof BUILDINGS>({
    ...BUILDINGS,
  });
  const [part_dict, setPartDict] = useState<
    Record<number, FullParticipantType>
  >({});
  const [players, setPlayers] = useState<any>([]);
  const champions = useBasicChampions();
  const [outerTimelineIndex, setOuterTimelineIndex] = useTimelineIndex(
    match._id
  );

  const image_size = 500;
  const max_x = 15300;
  const max_y = 15000;
  const slice = timeline[index] as FrameType;

  function getPosition(x: number, y: number): [number, number] {
    const x_val = (x / max_x) * image_size;
    const y_val = (y / max_y) * image_size;
    return [x_val, y_val];
  }

  const displayEvents = useCallback(() => {
    return [
      ...slice.buildingkillevents.map((ev) => {
        const pos = getPosition(ev.x, ev.y);
        return (
          <EventBubble
            key={`building-${ev.timestamp}-${ev.x}`}
            part_dict={part_dict}
            buildingKillEvent={ev}
            pos={pos}
          />
        );
      }),
      ...slice.championkillevents.map((ev) => {
        const pos = getPosition(ev.x, ev.y);
        return (
          <EventBubble
            key={`kill-${ev.timestamp}-${ev.x}`}
            part_dict={part_dict}
            championKillEvent={ev}
            pos={pos}
          />
        );
      }),
      ...slice.turretplatedestroyedevents.map((ev, key) => {
        // for whatever reason, I can have multiple identical events?
        const pos = getPosition(ev.x, ev.y);
        return (
          <EventBubble
            key={`plating-${ev.timestamp}-${pos}-${key}`}
            part_dict={part_dict}
            turretPlateDestroyedEvent={ev}
            pos={pos}
          />
        );
      }),
      ...slice.elitemonsterkillevents.map((ev) => {
        const pos = getPosition(ev.x, ev.y);
        return (
          <EventBubble
            key={`monster-${ev.timestamp}-${ev.x}-${ev.y}`}
            part_dict={part_dict}
            eliteMonsterKillEvent={ev}
            pos={pos}
          />
        );
      }),
    ];
  }, [slice, part_dict]);

  const stepForward = useCallback(() => {
    const newindex = index + 1;
    if (newindex < timeline.length) {
      setIndex(newindex);
      const new_buildings = { ...buildings };
      for (const ev of slice.buildingkillevents) {
        let team = "BLUE";
        if (ev.team_id === 200) {
          team = "RED";
        }
        const key =
          `${team}-${ev.building_type}-${ev.lane_type}-${ev.tower_type}` as keyof typeof BUILDINGS;
        if (new_buildings[key] !== undefined) {
          new_buildings[key].is_alive = false;
        }
      }
      setBuildings(new_buildings);
    }
  }, [index, timeline, buildings, slice.buildingkillevents]);

  const stepBackward = useCallback(() => {
    const newindex = index - 1;
    if (newindex >= 0) {
      setIndex(newindex);
      const new_buildings = { ...buildings };
      for (const ev of slice.buildingkillevents) {
        let team = "BLUE";
        if (ev.team_id === 200) {
          team = "RED";
        }
        const key =
          `${team}-${ev.building_type}-${ev.lane_type}-${ev.tower_type}` as keyof typeof BUILDINGS;
        if (new_buildings[key] !== undefined) {
          new_buildings[key].is_alive = true;
        }
      }
      setBuildings(new_buildings);
    }
  }, [index, buildings, slice.buildingkillevents]);

  const getPlayers = useCallback(
    function () {
      const new_players = [];
      for (const pframe of slice.participantframes) {
        const part = part_dict[pframe.participant_id];
        new_players.push({ pframe, part });
      }
      setPlayers(new_players);
    },
    [slice, part_dict]
  );

  useEffect(() => {
    if (participants.length > 0) {
      const data: Record<number, FullParticipantType> = {};
      for (const part of participants) {
        data[part._id] = part;
      }
      setPartDict(data);
    }
  }, [participants]);

  useEffect(() => {
    if (Object.keys(part_dict).length > 0) {
      getPlayers();
    }
  }, [part_dict, getPlayers]);

  useEffect(() => {
    const new_buildings = { ...BUILDINGS };
    let key: keyof typeof BUILDINGS;
    for (key in new_buildings) {
      new_buildings[key].is_alive = true;
    }
    setBuildings(new_buildings);
  }, []);

  useEffect(() => {
    if (index < outerTimelineIndex) {
      stepForward();
    } else if (index > outerTimelineIndex) {
      stepBackward();
    }
  }, [stepForward, stepBackward, outerTimelineIndex, index]);

  return (
    <div style={{ display: "inline-block" }}>
      <div style={{ position: "relative" }}>
        <Image
          height={image_size}
          width={image_size}
          className="min-w-fit rounded-md"
          src="/gen/map.jpg"
          alt="League Map"
        />

        {Object.keys(buildings).map((key) => {
          const data = buildings[key as keyof typeof BUILDINGS];
          return (
            <Building
              key={`${match._id}-${key}`}
              pos={getPosition(data.x, data.y)}
              is_alive={data.is_alive}
            />
          );
        })}

        {players.length > 0 &&
          players.map((player: any) => {
            const [x, y] = getPosition(player.pframe.x, player.pframe.y);
            let border_color = "red";
            if (player.part.team_id === 100) {
              border_color = "blue";
            }
            return (
              <div
                key={player.part._id}
                style={{
                  transitionDuration: ".3s",
                  position: "absolute",
                  left: x,
                  bottom: y,
                }}
              >
                {champions[player.part.champion_id]?.image?.file_30 ? (
                  <Image
                    className="rounded-full"
                    width={25}
                    height={25}
                    style={{
                      border: `2px solid ${border_color}`,
                    }}
                    src={mediaUrl(
                      champions[player.part.champion_id]?.image?.file_30
                    )}
                    alt="participant bubble"
                  />
                ) : (
                  <div
                    className="h-[25px] w-[25px] rounded-full border-2"
                    style={{ borderColor: border_color }}
                  />
                )}
              </div>
            );
          })}

        {displayEvents()}
      </div>

      <div className="mt-1 flex">
        <button
          onClick={() => {
            if (index > 0) {
              setOuterTimelineIndex((index) => index - 1);
            }
          }}
          className="btn btn-default"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-3 w-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 19.5L8.25 12l7.5-7.5"
            />
          </svg>
        </button>
        <button
          style={{ marginLeft: 8 }}
          onClick={() => {
            if (index < timeline.length - 1) {
              setOuterTimelineIndex((index) => index + 1);
            }
          }}
          className="btn btn-default"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-3 w-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 4.5l7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
        <div style={{ marginLeft: 8, display: "inline-block" }}>
          {index} min
        </div>
      </div>
    </div>
  );
}

function EventBubble({
  buildingKillEvent,
  championKillEvent,
  turretPlateDestroyedEvent,
  eliteMonsterKillEvent,
  pos,
  part_dict,
}: {
  buildingKillEvent?: BuildingKillEventType;
  championKillEvent?: ChampionKillEventType;
  turretPlateDestroyedEvent?: TurretPlateDestroyedEventType;
  eliteMonsterKillEvent?: EliteMonsterKillEventType;
  pos: [number, number];
  part_dict: Record<number, FullParticipantType>;
}) {
  const champions = useBasicChampions();
  const [isOpen, setIsOpen] = useState(false);
  const ev =
    buildingKillEvent ||
    championKillEvent ||
    turretPlateDestroyedEvent ||
    eliteMonsterKillEvent;
  if (!ev) {
    return null;
  }
  if (Object.keys(part_dict).length === 0) {
    return null;
  }
  let team_id: number;
  if (buildingKillEvent) {
    team_id = buildingKillEvent.team_id === 100 ? 200 : 100;
  } else if (championKillEvent) {
    if (championKillEvent.victim_id) {
      const victim = part_dict[championKillEvent.victim_id] as ValueOf<
        typeof part_dict
      >;
      team_id = victim.team_id === 100 ? 200 : 100;
    } else {
      team_id = part_dict[championKillEvent.killer_id]!.team_id;
    }
  } else if (turretPlateDestroyedEvent) {
    team_id = turretPlateDestroyedEvent.team_id === 100 ? 200 : 100;
  } else if (eliteMonsterKillEvent) {
    team_id = eliteMonsterKillEvent.killer_team_id;
  } else {
    console.error("Could not find team id.");
    console.log(ev);
    return null;
  }
  const size = 25;
  const img_style = {
    height: 35,
    borderRadius: 8,
    display: "inline-block",
  };

  const div_style = {
    marginTop: 25,
    display: "inline-block",
  };

  const red =
    "linear-gradient(60deg, rgb(86, 14, 123) 0%, rgb(230, 147, 22) 100%)";
  const blue =
    "linear-gradient(66deg, rgb(64, 131, 171) 0%, rgb(15, 63, 123) 100%)";

  let bubble_color = red;
  if (team_id === 100) {
    bubble_color = blue;
  }

  const sword_style = {
    margin: "5px 10px",
    height: 20,
    transform: "scaleX(-1)",
  };

  const getKillAssists = (victimdamagereceived_set: VictimDamageType[]) => {
    const out: Record<string, { name: string; damage: number }> = {};
    for (const item of victimdamagereceived_set) {
      const addedDamage =
        item.physical_damage + item.magic_damage + item.true_damage;
      const piece = out[item.name];
      if (piece) {
        piece.damage += addedDamage;
      } else {
        out[item.name] = {
          name: item.name,
          damage: addedDamage,
        };
      }
    }
    return Object.values(out);
  };

  return (
    <Popover
      key={`event-${ev.x}-${ev.y}`}
      isOpen={isOpen}
      content={
        <div>
          {championKillEvent && (
            <div style={div_style}>
              {ev.killer_id !== 0 && (
                <div style={{ display: "inline-block" }}>
                  <Image
                    style={img_style}
                    width={img_style.height}
                    height={img_style.height}
                    src={mediaUrl(
                      champions?.[
                        part_dict[ev.killer_id]?.champion_id || 10000000
                      ]?.image?.file_40
                    )}
                    alt=""
                  />
                </div>
              )}
              {ev.killer_id === 0 && <div>Executed</div>}
              <div
                style={{
                  display: "inline-block",
                  background: "white",
                  borderRadius: 8,
                  margin: "0px 5px",
                }}
              >
                <Image
                  style={sword_style}
                  width={sword_style.height}
                  height={sword_style.height}
                  src={SWORD}
                  alt=""
                />
              </div>
              <Image
                style={img_style}
                width={img_style.height}
                height={img_style.height}
                src={mediaUrl(
                  champions?.[
                    part_dict?.[championKillEvent.victim_id]?.champion_id ||
                      1000000
                  ]?.image?.file_40
                )}
                alt=""
              />
              <div>
                {getKillAssists(championKillEvent.victimdamagereceived_set)
                  .sort((a, b) => b.damage - a.damage)
                  .map((item) => {
                    return (
                      <div
                        style={{ marginBottom: 0 }}
                        className="grid grid-cols-2"
                        key={item.name}
                      >
                        <div>{mapAssistName(item.name)}</div>
                        <div>: {item.damage}</div>
                      </div>
                    );
                  })}
              </div>
              <div>
                <div>
                  Kill Gold:{" "}
                  <b>
                    {championKillEvent.bounty +
                      championKillEvent.shutdown_bounty}
                  </b>{" "}
                  ({championKillEvent.bounty} +{" "}
                  {championKillEvent.shutdown_bounty})
                </div>
              </div>
            </div>
          )}

          {eliteMonsterKillEvent && (
            <div style={div_style}>
              {ev.killer_id !== 0 && (
                <>
                  <Image
                    width={img_style.height}
                    height={img_style.height}
                    style={img_style}
                    src={mediaUrl(
                      champions?.[
                        part_dict[ev.killer_id]?.champion_id || 1000000
                      ]?.image?.file_40
                    )}
                    alt=""
                  />
                  <div style={{ display: "inline-block", margin: "0px 8px" }}>
                    {" "}
                    killed{" "}
                  </div>
                  <span>{eliteMonsterKillEvent.monster_type}</span>
                </>
              )}
              {ev.killer_id === 0 && (
                <div style={{ display: "inline-block" }}>
                  {eliteMonsterKillEvent.monster_type} executed
                </div>
              )}
            </div>
          )}

          {buildingKillEvent && (
            <div style={div_style}>
              {ev.killer_id !== 0 && (
                <Image
                  width={img_style.height}
                  height={img_style.height}
                  style={img_style}
                  src={mediaUrl(
                    champions?.[part_dict[ev.killer_id]?.champion_id || 1000000]
                      ?.image?.file_40
                  )}
                  alt=""
                />
              )}
              {!ev.killer_id && (
                <div style={{ display: "inline-block" }}>minions</div>
              )}
              <div
                style={{
                  display: "inline-block",
                  background: "white",
                  borderRadius: 8,
                  margin: "0px 5px",
                }}
              >
                <Image
                  height={sword_style.height}
                  width={sword_style.height}
                  style={sword_style}
                  src={SWORD}
                  alt=""
                />
              </div>
              <span>structure</span>
            </div>
          )}

          {turretPlateDestroyedEvent && (
            <div style={div_style}>
              <div
                style={{
                  display: "inline-block",
                  background: "white",
                  borderRadius: 8,
                  margin: "0px 5px",
                }}
              >
                <Image
                  height={sword_style.height}
                  width={sword_style.height}
                  style={sword_style}
                  src={SWORD}
                  alt=""
                />
              </div>
              <span>Turret Plating</span>
            </div>
          )}
        </div>
      }
    >
      <div
        onMouseOver={() => setIsOpen(true)}
        onMouseOut={() => setIsOpen(false)}
        className="absolute rounded-full"
        style={{
          background: bubble_color,
          width: size,
          height: size,
          left: pos[0],
          bottom: pos[1],
        }}
      ></div>
    </Popover>
  );
}

function Building({
  is_alive,
  pos,
}: {
  is_alive: boolean;
  pos: [number, number];
}) {
  const size = 15;

  const style = {
    background: "white",
    border: "3px solid black",
  };
  if (!is_alive) {
    style.background = "#7f3c3c";
    style.border = "3px solid #541616fa";
  }
  return (
    <div
      style={{
        position: "absolute",
        left: pos[0],
        bottom: pos[1],
        height: size,
        width: size,
        borderRadius: "50%",
        ...style,
      }}
    ></div>
  );
}
