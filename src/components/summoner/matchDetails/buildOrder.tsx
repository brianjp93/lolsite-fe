import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import type { CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
import ReactDOMServer from "react-dom/server";
import numeral from "numeral";
import api from "@/external/api/api";
import { useBasicChampions, useMatch, useSimpleItem } from "@/hooks";
import type {
  FrameType,
  FullParticipantType,
  ItemPurchasedEventType,
  ItemSoldEventType,
  ItemUndoEventType,
  SummonerType,
} from "@/external/types";
import { getMyPart, mediaUrl } from "@/components/utils";
import Image from "next/image";
import {ItemPopover} from "@/components/data/item";

type EventWithCount = (
  | ItemPurchasedEventType
  | ItemSoldEventType
  | ItemUndoEventType
) & {
  count?: number;
};

interface PurchaseHistory {
  [key: number]: { [key: number]: EventWithCount[] };
}

function BuildOrder(props: {
  timeline?: FrameType[] | null;
  expanded_width: number;
  participants: FullParticipantType[];
  summoner: SummonerType;
  match_id: string;
}) {
  const my_part = getMyPart(props.participants, props.summoner.puuid);
  const [participant_selection, setParticipantSelection] = useState(
    my_part?._id
  );
  const [purchase_history, setPurchaseHistory] = useState<PurchaseHistory>({});
  const [skills, setSkillsHistory] = useState<any>({});
  const match = useMatch(props.match_id.toString()).data;

  // build or skill
  const [display_page, setDisplayPage] = useState("build");

  const image_width = 30;
  const usable_width = props.expanded_width - 30;
  const available_width =
    usable_width - props.participants.length * image_width;
  const padding_pixels = available_width / props.participants.length;
  const participants = [
    ...props.participants.filter((participant) => participant.team_id === 100),
    ...props.participants.filter((participant) => participant.team_id === 200),
  ];

  const participant_data = useMemo(() => {
    for (const part of props.participants) {
      if (part._id === participant_selection) {
        return part;
      }
    }
    return null;
  }, [props.participants, participant_selection]);

  // remove items which were purchased/sold and the player hit UNDO
  const remove_undos = (
    purchase_groups: { [key: string]: EventWithCount }[]
  ) => {
    for (const i in purchase_groups) {
      const frame = purchase_groups[i];
      const remove_items: { [key: number]: number } = {};
      for (const key in frame) {
        const event = frame[key] as EventWithCount;
        if (event._type === "ITEM_UNDO") {
          if (event.after_id === 0) {
            const id = event.before_id;
            if (remove_items[id] === undefined) {
              remove_items[id] = 0;
            }
            remove_items[id]++;
          } else if (event.before_id === 0) {
            const id = event.after_id;
            if (remove_items[id] === undefined) {
              remove_items[id] = 0;
            }
            remove_items[id]--;
          }
        }
      }

      // attempt to remove items which were either
      // purchased and undo or sold and undo
      for (const key in frame) {
        const event = frame[key] as EventWithCount;
        if (event._type === "ITEM_PURCHASED") {
          const id = event.item_id;
          if ((remove_items[id] || 0) > 0) {
            if (event.count !== undefined) {
              event.count--;
            }
            remove_items[id]--;
          }
        }
      }

      const framecopy = { ...frame };
      for (const key in frame) {
        const event = frame[key] as EventWithCount;
        if (event.count !== undefined && event.count <= 0) {
          delete framecopy[key];
        }
      }
      purchase_groups[i] = framecopy;
    }
    return purchase_groups;
  };

  const participant_groups = useMemo(() => {
    const groups = [];
    if (!participant_selection) return [];
    if (purchase_history[participant_selection] !== undefined) {
      for (const i in purchase_history[participant_selection]) {
        const thing = purchase_history[participant_selection]
        if (thing) {
          const index = parseInt(i)
          const group = thing[index];
          groups.push(group);
        }
      }
    }

    let groups_with_count = [];
    for (const group of groups) {
      if (!group) {
        continue
      }
      const group_count: { [key: string]: EventWithCount } = {};
      for (const event of group) {
        let key: string;
        if (event._type === "ITEM_UNDO") {
          key = `${event.before_id}-${event.after_id}`;
        } else {
          key = `${event?.item_id}`;
        }
        const item = group_count[key]
        if (item === undefined) {
          event.count = 1;
          group_count[key] = event;
        } else {
          item.count = (item.count || 1) + 1;
        }
      }
      groups_with_count.push(group_count);
    }
    groups_with_count = remove_undos(groups_with_count);
    return groups_with_count;
  }, [purchase_history, participant_selection]);

  // PURCHASE HISTORY EFFECT
  useEffect(() => {
    const purchase: {
      [key: number]: { [key: number]: Array<EventWithCount> };
    } = {};
    if (props.timeline) {
      for (let i = 0; i < props.timeline.length; i++) {
        const frame = props.timeline[i];
        if (!frame) return
        for (const event of [
          ...(frame.itempurchaseevents as EventWithCount[]),
          ...(frame.itemundoevents as EventWithCount[]),
          ...(frame.itemsoldevents as EventWithCount[]),
        ]) {
          const item = purchase[event.participant_id]
          if (item === undefined) {
            purchase[event.participant_id] = {};
          }
          if (item?.[i] === undefined) {
            purchase[event.participant_id]![i] = [];
          }
          purchase[event.participant_id]![i]!.push(event);
        }
      }
      setPurchaseHistory(purchase);
    }
  }, [props.timeline]);

  // SKILL LEVEL UP HISTORY
  useEffect(() => {
    const skills: any = {};
    if (props.timeline) {
      for (let i = 0; i < props.timeline.length; i++) {
        const frame: any = props.timeline[i];
        for (const event of frame.skilllevelupevents) {
          if (skills[event.participant_id] === undefined) {
            skills[event.participant_id] = [];
          }
          skills[event.participant_id].push(event);
        }
      }
      setSkillsHistory(skills);
    }
  }, [props.timeline]);

  let count = 0;
  let lines = 1;
  return (
    <div style={{ marginLeft: 30 }}>
      {participants.map((participant, _) => {
        return (
          <ChampionImage
            key={`${participant.puuid}-champion-image`}
            is_me={participant._id === my_part?._id}
            is_selected={participant._id === participant_selection}
            image_width={image_width}
            participant={participant}
            padding_pixels={padding_pixels}
            handleClick={() => {
              if (participant._id !== participant_selection) {
                setParticipantSelection(participant._id);
              }
            }}
          />
        );
      })}

      <div className="my-2 grid grid-cols-2">
        <div>
          <label htmlFor={`${props.match_id}-build-selection`}>
            <input
              className="inline"
              id={`${props.match_id}-build-selection`}
              onChange={useCallback(() => setDisplayPage("build"), [])}
              type="radio"
              tabIndex={1}
              checked={display_page === "build"}
            />
            <div className="ml-1 inline">Build Order</div>
          </label>
        </div>
        <div>
          <label htmlFor={`${props.match_id}-skill-selection`}>
            <input
              id={`${props.match_id}-skill-selection`}
              onChange={useCallback(() => setDisplayPage("skill"), [])}
              type="radio"
              checked={display_page === "skill"}
              tabIndex={1}
              className="inline"
            />
            <div className="ml-1 inline">Skill Order</div>
          </label>
        </div>
      </div>

      {display_page === "build" && (
        <div
          className="quiet-scroll"
          style={{ marginTop: 5, overflowY: "scroll", height: 300, width: 385 }}
        >
          {(participant_groups || []).map((group, key) => {
            const total_seconds =
              (Object.values(group)[0]?.timestamp || 0) / 1000;
            const minutes = Math.floor(total_seconds / 60);
            const seconds = Math.floor(total_seconds % 60);
            count++;
            let div_style: CSSProperties = { display: "inline-block" };
            if (count > lines * 9) {
              lines++;
              div_style = { display: "block" };
            }
            const some_group = participant_groups[key + 1]
            return (
              <span key={`${props.match_id}-${key}`}>
                <div style={div_style}></div>
                <div style={{ display: "inline-block" }} key={key}>
                  {Object.values(group).filter((x) => x._type !== "ITEM_UNDO")
                    .length > 0 && (
                    <div style={{ display: "block", color: "grey", width: 50 }}>
                      {minutes}:{numeral(seconds).format("00")}
                    </div>
                  )}
                  <div>
                    {Object.values(group).map((event, sub_key) => {
                      if (event._type !== "ITEM_UNDO") {
                        count++;
                        if (!match?.major || !match?.minor) return null;
                        return (
                          <div key={sub_key} className="inline-block">
                            <div className="relative inline-block">
                              <ItemImage major={match.major} minor={match.minor} item_id={event.item_id} event_type={event._type}/>
                              {(event.count || 1) > 1 && (
                                <div
                                  style={{
                                    position: "absolute",
                                    bottom: 5,
                                    right: 0,
                                    width: 15,
                                    background: "white",
                                    color: "black",
                                    opacity: "0.70",
                                    textAlign: "center",
                                    fontSize: "75%",
                                    borderRadius: 5,
                                  }}
                                >
                                  {event.count}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })}
                    {key < participant_groups.length - 1 &&
                      Object.values(some_group || {}).filter(
                        (x) => x._type !== "ITEM_UNDO"
                      ).length > 0 && (
                        <div className="inline-block">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-6 w-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                            />
                          </svg>
                        </div>
                      )}
                  </div>
                </div>
              </span>
            );
          })}
        </div>
      )}
      {display_page === "skill" &&
        participant_data &&
        participant_selection !== undefined && (
          <SkillLevelUp
            skills={skills[participant_selection]}
            selected_participant={participant_data}
            expanded_width={props.expanded_width}
          />
        )}
    </div>
  );
}

function ItemImage({major, minor, item_id, event_type}: {major: number, minor: number, item_id: number, event_type: string}) {
  const item = useSimpleItem({id: item_id, major, minor}).data
  let image_style = {};
  if (event_type === "ITEM_SOLD") {
    image_style = {
      ...image_style,
      opacity: 0.3,
      borderWidth: 3,
      borderStyle: "solid",
      borderColor: "darkred",
    };
  }
  if (!item) return null
  return (
    <ItemPopover major={major} minor={minor} item_id={item_id} >
      <Image
        style={{
          borderRadius: 5,
          ...image_style,
        }}
        height={30}
        width={30}
        src={mediaUrl(item.image.file_30)}
        alt=""
      />
    </ItemPopover>
  )
}

function ChampionImage(props: {
  is_me: boolean;
  is_selected: boolean;
  participant: FullParticipantType;
  image_width: number;
  padding_pixels: number;
  handleClick: () => void;
}) {
  const champions = useBasicChampions();
  let image_style: any = {
    cursor: "pointer",
    width: 30,
    height: 30,
  };
  if (!props.is_selected) {
    image_style = {
      ...image_style,
      opacity: 0.3,
    };
  } else {
    image_style = {
      ...image_style,
      borderWidth: 3,
      borderColor: "white",
      borderStyle: "solid",
    };
  }

  const vert_align: CSSProperties = {};
  const champ = champions[props.participant.champion_id];
  const champ_image = champ?.image?.file_30;
  if (champ_image === undefined) {
    vert_align.verticalAlign = "top";
  }
  return (
    <div
      style={{
        display: "inline-block",
        paddingRight: props.padding_pixels,
        ...vert_align,
      }}
    >
      {champ_image === undefined && (
        <div
          role="button"
          tabIndex={1}
          onKeyDown={(event) => {
            if ((event.key === "Enter")) {
              props.handleClick();
            }
          }}
          className="inline-block"
          onClick={props.handleClick}
          style={{ ...image_style }}
        >
          NA
        </div>
      )}
      {champ_image !== undefined && (
        <Image
          onClick={props.handleClick}
          role="button"
          tabIndex={1}
          onKeyDown={(event) => {
            if ((event.key === "Enter")) {
              props.handleClick();
            }
          }}
          style={{ ...image_style }}
          height={30}
          width={30}
          aria-label={champ?.name}
          src={mediaUrl(champ?.image?.file_30)}
          alt={`Champion Image: ${champ?.name}`}
        />
      )}
    </div>
  );
}

function SkillLevelUp(props: {
  selected_participant: FullParticipantType;
  expanded_width: number;
  skills: any;
}) {
  const champions = useBasicChampions();

  const spellQuery = useQuery(
    ["spells", props.selected_participant.champion_id],
    () =>
      api.data
        .getChampionSpells({
          champion_id: champions[props.selected_participant.champion_id]!._id,
        })
        .then((response) => {
          const output: any = {};
          const data = response.data.data;
          for (let i = 0; i < data.length; i++) {
            const spell = data[i];
            const letter = ["q", "w", "e", "r"][i] || 'q';
            output[letter] = spell;
          }
          return output;
        }),
    {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 10,
      enabled:
        Object.keys(champions).length > 0 &&
        !!props.selected_participant.champion_id,
    }
  );
  const spells = useMemo(() => spellQuery.data || {}, [spellQuery.data]);

  const div_width = (props.expanded_width - 65) / 18;
  const div_height = 30;
  return (
    <div>
      {props.skills !== undefined &&
        [...Array(19).keys()].map((num) => {
          const skill = props.skills[num - 1];
          return (
            <div key={num} style={{ display: "inline-block" }}>
              {["lvl", "q", "w", "e", "r"].map((skill_num, key) => {
                let output: any = ".";
                let div_style: any = {
                  height: div_height,
                  width: div_width,
                  borderStyle: "solid",
                  borderColor: "grey",
                  borderWidth: 1,
                };
                if (num === 0) {
                  div_style = {
                    height: div_height,
                    width: 30,
                    borderStyle: "solid",
                    borderColor: "grey",
                    borderWidth: 0,
                  };
                  if (["q", "w", "e", "r"].indexOf(skill_num) >= 0) {
                    output = (
                      <span>
                        <div
                          data-html
                          data-tip={ReactDOMServer.renderToString(
                            <div
                              style={{
                                maxWidth: 500,
                                wordBreak: "normal",
                                whiteSpace: "normal",
                              }}
                            >
                              {spells[skill_num] !== undefined && (
                                <div>
                                  <div>
                                    <div
                                      style={{
                                        display: "inline-block",
                                      }}
                                    >
                                      <Image
                                        className="rounded-sm"
                                        src={mediaUrl(
                                          spells[skill_num].image_url
                                        )}
                                        height={50}
                                        width={50}
                                        alt=""
                                      />
                                    </div>
                                    <h4
                                      style={{
                                        display: "inline-block",
                                        marginLeft: 10,
                                      }}
                                    >
                                      {spells[skill_num].name}
                                    </h4>
                                  </div>
                                  <div
                                    dangerouslySetInnerHTML={{
                                      __html: spells[skill_num].description,
                                    }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          )}
                          style={{
                            width: 30,
                            height: 30,
                            position: "relative",
                          }}
                        >
                          {skill_num}

                          {spells[skill_num] !== undefined && (
                            <Image
                              src={mediaUrl(spells[skill_num].image_url)}
                              alt=""
                              height={30}
                              width={30}
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                borderStyle: "solid",
                                borderColor: "grey",
                                borderWidth: 2,
                              }}
                            />
                          )}
                        </div>
                      </span>
                    );
                  } else {
                    output = ".";
                  }
                } else if (skill_num === "lvl") {
                  div_style = {
                    ...div_style,
                    borderStyle: "none",
                    borderWidth: 0,
                  };
                  output = `${num}`;
                } else if (skill !== undefined && skill.skill_slot === key) {
                  div_style = {
                    ...div_style,
                    textAlign: "center",
                    background: "#196893",
                  };
                  output = skill_num;
                } else {
                  output = ".";
                }
                return (
                  <div key={key} style={div_style}>
                    <span>{output}</span>
                  </div>
                );
              })}
            </div>
          );
        })}
    </div>
  );
}

export default BuildOrder;
