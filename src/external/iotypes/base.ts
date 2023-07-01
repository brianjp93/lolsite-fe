import * as t from "io-ts";
import { z } from "zod";

export function maybe(x: t.Mixed) {
  return t.union([x, t.undefined]);
}

export function optional(x: t.Mixed) {
  return t.union([x, t.null]);
}

export function PaginatedResponse<C extends t.Mixed>(codec: C) {
  return t.type({
    next: optional(t.string),
    previous: optional(t.string),
    count: t.number,
    results: t.array(codec),
  });
}
export type PaginatedResponseType<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export function PaginatedCursorResponse<C extends t.Mixed>(codec: C) {
  return t.type({
    next: optional(t.string),
    previous: optional(t.string),
    results: t.array(codec),
  })
}
export type PaginatedCursorResponse<T> = {
  next: string | null;
  previous: string | null;
  results: T[];
};

export const MetaHead = z.object({
  type: z.string().default(""),
  title: z.string().default(""),
  url: z.string().default(""),
  image: z.string().default(""),
  description: z.string().default(""),
});

export type MetaHead = z.infer<typeof MetaHead>;
