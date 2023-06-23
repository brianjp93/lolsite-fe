import * as t from "io-ts";
import { z } from "zod";
import { optional } from "./base";

export const ItemImage = t.type({
  file: optional(t.string),
  file_15: optional(t.string),
  file_30: optional(t.string),
  file_40: optional(t.string),
});
export type ItemImageType = t.TypeOf<typeof ItemImage>;

export const ItemGold = t.type({
  id: t.number,
  base: t.number,
  purchasable: t.boolean,
  sell: t.number,
  total: t.number,
  item: t.number,
});

export const Item = t.type({
  id: t.number,
  gold: ItemGold,
  image: ItemImage,
  stats: t.record(t.string, t.number),
  maps: t.record(t.string, t.boolean),
  major: t.number,
  minor: t.number,
  patch: t.number,
  _id: t.number,
  version: t.string,
  language: t.string,
  colloq: t.string,
  depth: optional(t.number),
  group: t.string,
  description: t.string,
  name: t.string,
  plaintext: t.string,
  required_ally: t.string,
  required_champion: t.string,
  in_store: t.boolean,
  consumed: t.boolean,
  consume_on_full: t.boolean,
  special_recipe: optional(t.number),
  stacks: optional(t.number),
  last_changed: optional(t.string),
});
export type ItemType = t.TypeOf<typeof Item>;

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
