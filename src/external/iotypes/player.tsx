import * as t from "io-ts";
import { optional, maybe } from "./base";
import { z } from "zod";

export const User = t.type({
  email: t.string,
});
export type UserType = t.TypeOf<typeof User>;

export const NameChange = t.type({
  old_name: t.string,
  created_date: t.string,
});
export type NameChangeType = t.TypeOf<typeof NameChange>;

export const Position = t.type({
  checkpoint: t.number,
  fresh_blood: t.boolean,
  hot_streak: t.boolean,
  id: t.number,
  inactive: t.boolean,
  league_points: t.number,
  losses: t.number,
  position: t.string,
  queue_type: t.string,
  rank: t.string,
  rank_integer: t.number,
  series_progress: optional(t.string),
  tier: t.string,
  veteran: t.boolean,
  wins: t.number,
});
export type PositionType = t.TypeOf<typeof Position>;

export const RankExtreme = t.type({
  tier: t.string,
  division: t.string,
  league_points: t.number,
});

export const PositionBin = t.type({
  day: t.number,
  month: t.number,
  peak_rank: RankExtreme,
  peak_rank_integer: t.number,
  start_date: t.string,
  trough_rank: RankExtreme,
  trough_rank_integer: t.number,
  week: t.number,
  year: t.number,
});
export type PositionBinType = t.TypeOf<typeof PositionBin>;

export const Summoner = t.type({
  has_match_overlap: t.number,
  id: t.number,
  name: t.string,
  profile_icon_id: t.number,
  profile_icon: t.string,
  puuid: t.string,
  region: t.string,
  simple_name: t.string,
  summoner_level: t.number,
  _id: t.string,
});
export type SummonerType = t.TypeOf<typeof Summoner>;

export const SummonerSearch = t.type({
  name: t.string,
  summoner_level: optional(t.number),
});
export type SummonerSearchType = t.TypeOf<typeof SummonerSearch>;

export const TopPlayedWithPlayer = t.type({
  puuid: maybe(t.string),
  summoner_name: maybe(t.string),
  wins: t.number,
  count: t.number,
});
export type TopPlayedWithPlayerType = t.TypeOf<typeof TopPlayedWithPlayer>;

export const Reputation = t.type({
  id: t.number,
  is_approve: t.boolean,
});
export type ReputationType = t.TypeOf<typeof Reputation>;

export const Favorite = z.object({
  name: z.string(),
  region: z.string(),
  sort_int: z.number(),
  puuid: z.string(),
  summoner_id: z.string(),
});
export type Favorite = z.infer<typeof Favorite>;

export const PlayerChampionSummaryResponse = z.object({
  assists_sum: z.number(),
  champion: z.string(),
  champion_id: z.number(),
  count: z.number(),
  cspm: z.number(),
  damage_dealt_to_objectives_sum: z.number(),
  damage_dealt_to_turrets_sum: z.number(),
  deaths_sum: z.number(),
  dpm: z.number(),
  dtpd: z.number(),
  dtpm: z.number(),
  gold_earned_sum: z.number(),
  gpm: z.number(),
  kda: z.number(),
  kills_sum: z.number(),
  losses: z.number(),
  minutes: z.number(),
  objective_dpm: z.number(),
  total_damage_dealt_to_champions_sum: z.number(),
  total_damage_taken_sum: z.number(),
  turret_dpm: z.number(),
  vspm: z.number(),
  wins: z.number(),
});

export type PlayerChampionSummaryResponse = z.infer<
  typeof PlayerChampionSummaryResponse
>;

export const SuspiciousPlayer = z.object({
  quick_ff_count: z.number(),
  total: z.number(),
})
export type SuspiciousPlayer = z.infer<typeof SuspiciousPlayer>;
