import * as t from "io-ts";
import { z } from "zod";
import { optional } from "./base";

export const ItemImage = z.object({
  file: z.string().optional(),
  file_15: z.string().nullable(),
  file_30: z.string().nullable(),
  file_40: z.string().nullable(),
});
export type ItemImageType = z.infer<typeof ItemImage>;

export const ItemGold = z.object({
  id: z.number(),
  base: z.number(),
  purchasable: z.boolean(),
  sell: z.number(),
  total: z.number(),
  item: z.number(),
});

export const Item = z.object({
  id: z.number(),
  gold: ItemGold,
  image: ItemImage,
  stats: z.record(z.number().nullable()),
  maps: z.record(z.boolean()),
  major: z.number(),
  minor: z.number(),
  patch: z.number(),
  _id: z.number(),
  version: z.string(),
  language: z.string(),
  colloq: z.string(),
  description: z.string(),
  name: z.string(),
  plaintext: z.string(),
  required_ally: z.string(),
  required_champion: z.string(),
  in_store: z.boolean(),
  consumed: z.boolean(),
  consume_on_full: z.boolean(),
  stacks: z.number().nullable(),
  last_changed: z.string().nullable(),
  diff: z.record(z.object({
    prev: z.string().or(z.number()).nullable(),
    curr: z.string().or(z.number()).nullable(),
  })).nullable(),
  stat_efficiency: z.object({
    calculated_cost: z.number(),
    gold_efficiency: z.number(),
  }).and(z.record(z.number())),
});
export type ItemType = z.infer<typeof Item>;

export const ChampionImage = t.type({
  file: optional(t.string),
  file_15: optional(t.string),
  file_30: optional(t.string),
  file_40: optional(t.string),
});
export type ChampionImageType = t.TypeOf<typeof ChampionImage>;

export const BasicChampionWithImage = t.type({
  _id: t.string,
  name: t.string,
  key: t.number,
  image: ChampionImage,
});
export type BasicChampionWithImageType = t.TypeOf<
  typeof BasicChampionWithImage
>;

export const Champion = t.type({
  image: ChampionImage,
  stats: t.unknown,
  spells: t.unknown,
  _id: t.string,
  version: t.string,
  language: t.string,
  key: t.number,
  name: t.string,
  partype: t.string,
  title: t.string,
  lore: t.string,
  last_changed: t.string,
  created_date: t.string,
});
export type ChampionType = t.TypeOf<typeof Champion>;

export const Rune = t.type({
  icon: t.string,
  id: t.number,
  image_url: t.string,
  key: t.string,
  long_description: t.string,
  name: t.string,
  reforgedtree: t.number,
  row: t.number,
  short_description: t.string,
  sort_int: t.number,
  _id: t.number,
});
export type RuneType = t.TypeOf<typeof Rune>;

export const Queue = z.object({
  _id: z.number(),
  _map: z.string(),
  description: z.string(),
});
export type QueueType = z.infer<typeof Queue>;
