import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import type { CSSProperties } from "react";
import { useQuery } from "@tanstack/react-query";
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
import clsx from "clsx";
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
              frame[key] = { ...event, count: event.count - 1 };
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
          group_count[key] = { ...event, count: 1 };
        } else {
          group_count[key] = { ...item, count: (item.count || 1) + 1 };
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
      {participants.map((participant) => {
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
  const champ = champions[props.participant.champion_id];
  const champ_image = champ?.image?.file_40;
  return (
    <div
      className="inline-block"
      style={{
        paddingRight: props.padding_pixels,
        verticalAlign: champ_image === undefined ? "top" : undefined,
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
          onClick={props.handleClick}
          className={clsx("inline-block h-[30px] w-[30px] cursor-pointer rounded-md transition-all", {
            "ring-2 ring-sky-400 brightness-110": props.is_selected,
            "opacity-50 hover:opacity-80": !props.is_selected,
          })}
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
          className={clsx("rounded-md cursor-pointer transition-all", {
            "ring-2 ring-sky-400 brightness-110": props.is_selected,
            "opacity-50 hover:opacity-80": !props.is_selected,
          })}
          height={30}
          width={30}
          aria-label={champ?.name}
          src={mediaUrl(champ_image)}
          alt={`Champion Image: ${champ?.name}`}
        />
      )}
    </div>
  );
}

const SKILL_COLORS: Record<string, { bg: string; text: string }> = {
  q: { bg: "bg-sky-500/80", text: "text-sky-300" },
  w: { bg: "bg-emerald-500/80", text: "text-emerald-300" },
  e: { bg: "bg-amber-500/80", text: "text-amber-300" },
  r: { bg: "bg-rose-500/80", text: "text-rose-300" },
};

const SKILL_KEYS = ["q", "w", "e", "r"] as const;

function SkillLevelUp(props: {
  selected_participant: FullParticipantType;
  expanded_width: number;
  skills: any;
}) {
  const champions = useBasicChampions();

  const spellQuery = useQuery({
    queryKey: ["spells", props.selected_participant.champion_id],
    queryFn: () =>
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
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 10,
    enabled:
      Object.keys(champions).length > 0 &&
      !!props.selected_participant.champion_id,
  });
  const spells = useMemo(() => spellQuery.data || {}, [spellQuery.data]);

  if (!props.skills) return null;

  const levels = Array.from({ length: 18 }, (_, i) => i + 1);

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-[2px] text-center text-xs">
        <thead>
          <tr>
            <th className="w-8" />
            {levels.map((lvl) => (
              <th
                key={lvl}
                className="w-6 pb-1 font-normal text-zinc-500"
              >
                {lvl}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SKILL_KEYS.map((skill, slotIndex) => {
            const spell = spells[skill];
            const colors = SKILL_COLORS[skill]!;
            return (
              <tr key={skill}>
                <td className="pr-1">
                  {spell ? (
                    <Image
                      src={mediaUrl(spell.image_url)}
                      alt={spell.name ?? skill}
                      title={spell.name}
                      height={24}
                      width={24}
                      className="rounded"
                    />
                  ) : (
                    <span className={clsx("text-sm font-bold uppercase", colors.text)}>
                      {skill}
                    </span>
                  )}
                </td>
                {levels.map((lvl) => {
                  const event = props.skills[lvl - 1];
                  const isSkilled = event?.skill_slot === slotIndex + 1;
                  return (
                    <td key={lvl}>
                      <div
                        className={clsx(
                          "flex h-6 w-6 items-center justify-center rounded",
                          isSkilled
                            ? clsx(colors.bg, "font-bold text-white")
                            : "bg-zinc-800/40"
                        )}
                      >
                        {isSkilled && (
                          <span className="text-[11px] uppercase">{skill}</span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default BuildOrder;
