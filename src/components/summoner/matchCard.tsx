import type { BasicParticipantType } from "@/external/iotypes/match";
import type { BasicMatchType, SummonerType } from "@/external/types";
import { useChampions } from "@/hooks";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import numeral from "numeral";
import { getMyPart, getTeam, mediaUrl } from "../utils";

export default function MatchCard({
  match,
  summoner,
}: {
  match: BasicMatchType;
  summoner: SummonerType;
}) {
  const part = getMyPart(match.participants, summoner.puuid);
  const myTeam = match.teams.filter((x) => x._id === part?.team_id)?.[0];
  const enemyTeam = match.teams.filter((x) => x._id !== part?.team_id)?.[0];
  const minutes = match.game_duration / 1000 / 60;
  const isTie = minutes < 5;
  return (
    <>
      <div
        className={clsx(
          "my-2 rounded-md bg-gradient-to-r to-zinc-900/50 p-2",
          "overflow-x-scroll",
          {
            "from-[#60102b66]": enemyTeam?.win && !isTie,
            "from-[#1d6944ba]": myTeam?.win && !isTie,
            "from-zinc-900/50": isTie,
          }
        )}
      >
        <div className="flex">
          <div className="my-auto h-full min-w-fit">
            <ChampionClump match={match} summoner={summoner} />
          </div>
          {part && (
            <>
              <div className="my-auto ml-1 h-full min-w-fit">
                <ItemClump part={part} />
              </div>
              <div className="my-auto ml-1">
                <StatClump part={part} match={match} />
              </div>
              <div className="my-auto ml-1">
                <ParticipantClump match={match} summoner={summoner} />
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function ParticipantClump({
  match,
  summoner,
}: {
  match: BasicMatchType;
  summoner: SummonerType;
}) {
  const team100 = getTeam(100, match.participants);
  const team200 = getTeam(200, match.participants);
  const part = getMyPart(match.participants, summoner.puuid);
  return (
    <div className="flex">
      <TeamClump team={team100} part={part} />
      <TeamClump team={team200} part={part} />
    </div>
  );
}

function TeamClump({
  team,
  part,
}: {
  team: BasicParticipantType[];
  part?: BasicParticipantType;
}) {
  const champions = useChampions();
  const { region } = useRouter().query as { region: string };
  return (
    <div className="w-44">
      {team.map((teammate) => {
        const champion = champions[teammate.champion_id];
        // remove extra spaces from names
        let name = teammate.summoner_name.split(/\s+/).join(" ");
        name = name.length > 11 ? name.slice(0, 9) + "..." : name;
        const link = (
          <div
            className={clsx("ml-1 text-xs", {
              "font-bold": teammate.puuid === part?.puuid,
            })}
            title={teammate.summoner_name}
          >
            {name}
          </div>
        );
        return (
          <div className="flex" key={teammate._id}>
            <>
              {champion && (
                <Image
                  className="rounded"
                  src={mediaUrl(champion.image.file_15)}
                  width={15}
                  height={15}
                  alt={champion.name}
                />
              )}
              {teammate.puuid !== part?.puuid ? (
                <Link href={`/${region}/${teammate.summoner_name}/`}>
                  {link}
                </Link>
              ) : (
                link
              )}
            </>
            <div className="ml-auto mr-1 flex text-xs">
              <div className="text-gray-400">{teammate.stats.kills}</div>
              <div className="mx-1 text-gray-500">/</div>
              <div className="text-gray-400">{teammate.stats.deaths}</div>
              <div className="mx-1 text-gray-500">/</div>
              <div className="text-gray-400">{teammate.stats.assists}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StatClump({
  part,
  match,
}: {
  part: BasicParticipantType;
  match: BasicMatchType;
}) {
  const deaths = part.stats.deaths || 1;
  const kda = (part.stats.kills + part.stats.assists) / deaths;
  const minutes = match.game_duration / 1000 / 60;
  const dpm = part.stats.total_damage_dealt_to_champions / minutes;
  const vspm = part.stats.vision_score / minutes;
  return (
    <div className="rounded-md bg-gray-900 px-2 py-1 leading-tight text-gray-400">
      <div className="mx-auto flex w-fit items-end">
        <div className="font-bold text-emerald-600">{part.stats.kills}</div>
        <div className="mx-1">/</div>
        <div className="font-bold text-red-600">{part.stats.deaths}</div>
        <div className="mx-1">/</div>
        <div className="font-bold text-cyan-600">{part.stats.assists}</div>
      </div>
      <div className="flex items-end">
        <div className="mr-2">{numeral(kda).format("0.00")}</div>
        <div className="ml-auto text-xs font-bold">KDA</div>
      </div>
      <div className="flex items-end">
        <div className="mr-2">{numeral(dpm).format("0")}</div>
        <div className="ml-auto text-xs font-bold">DPM</div>
      </div>
      <div className="flex items-end">
        <div className="mr-2">{numeral(vspm).format("0.00")}</div>
        <div className="ml-auto text-xs font-bold">VS/M</div>
      </div>
    </div>
  );
}

function ItemClump({ part }: { part: BasicParticipantType }) {
  return (
    <div className="grid grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const key = `item_${i}_image` as keyof typeof part.stats;
        const url = part.stats?.[key]?.file_30 || "";
        return (
          <div key={key}>
            {url && (
              <Image
                className="m-[1px] rounded-md"
                src={mediaUrl(url)}
                alt="Item image"
                height={30}
                width={30}
              />
            )}
            {!url && (
              <div className="m-[1px] h-[30px] w-[30px] rounded-md border border-white/30 bg-zinc-800/30"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChampionClump({
  match,
  summoner,
}: {
  match: BasicMatchType;
  summoner: SummonerType;
}) {
  const part = getMyPart(match.participants, summoner.puuid);
  const champions = useChampions();
  const champion = part?.champion_id ? champions[part?.champion_id] : undefined;
  if (!champion) return null;
  if (!part) return null;
  return (
    <div className="flex">
      <div>
        <Image
          src={mediaUrl(champion.image.file_40)}
          height={40}
          width={40}
          alt={`Champion Image: ${champion.name}`}
        />
        <div className="flex">
          <Image
            src={part.stats.perk_0_image_url}
            width={20}
            height={20}
            alt={""}
          />
          <Image
            src={part.stats.perk_sub_style_image_url}
            width={20}
            height={20}
            alt={""}
          />
        </div>
      </div>
      <div>
        <Image
          src={part.summoner_1_image || ""}
          width={20}
          height={20}
          alt={`Spell image: ${part?.summoner_1_id}`}
        />
        <Image
          src={part.summoner_2_image || ""}
          width={20}
          height={20}
          alt={`Spell image: ${part?.summoner_2_id}`}
        />
        <Image
          src={mediaUrl(part.stats.item_6_image?.file_30)}
          width={20}
          height={20}
          alt={""}
        />
      </div>
    </div>
  );
}
