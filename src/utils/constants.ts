import { type ValueOf } from "next/dist/shared/lib/constants";

export const REGIONS = [
  "na",
  "euw",
  "eune",
  "kr",
  "jp",
  "lan",
  "las",
  "br",
  "oce",
  "tr",
  "ru",
] as const;
export type Region = ValueOf<typeof REGIONS>;

export const QUEUEFILTER = [
  {
    name: "5v5 Ranked Solo/Duo",
    id: 420,
  },
  {
    name: "5v5 Ranked Flex",
    id: 440,
  },
  {
    name: "5v5 Norms Draft",
    id: 400,
  },
  {
    name: "5v5 Norms Blind",
    id: 430,
  },
  {
    name: "Custom Games",
    id: 0,
  },
  {
    name: "Clash",
    id: 700,
  },
  {
    name: "ARAM",
    id: 450,
  },
];
