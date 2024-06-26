import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { env } from "@/env/client.mjs";
import {
  unwrap,
  FullParticipant,
  SpectateMatch,
  BasicMatch,
  Frame,
  Ban,
  PaginatedResponse,
} from "../types";
import * as t from "io-ts";
import { MatchSummary, SimpleMatch, SimpleSpectate } from "../iotypes/match";

const version = "v1";
const base = `${env.NEXT_PUBLIC_BACKEND_URL}/api/${version}/match`;

axios.defaults.xsrfHeaderName = "X-CSRFTOKEN";
axios.defaults.xsrfCookieName = "csrftoken";

async function timeline(_id: string) {
  const url = `${base}/${_id}/timeline/`;
  const response = await axios.get(url);
  return unwrap(t.array(Frame).decode(response.data.frames));
}

interface ParticipantsData extends AxiosRequestConfig {
  match__id: string;
  apply_ranks: boolean;
}
async function participants(data: ParticipantsData) {
  const url = `${base}/participants/`;
  const response = await axios.get(url, { params: data });
  return { data: unwrap(t.array(FullParticipant).decode(response.data.data)) };
}

interface GetSpectateData extends AxiosRequestConfig {
  region: string;
  puuid: string;
}
async function getSpectate(data: GetSpectateData) {
  const url = `${base}/get-spectate/`;
  const response = await axios.get(url, {
    params: { region: data.region, puuid: data.puuid },
  });
  return unwrap(
    t.union([SpectateMatch, t.literal("not found")]).decode(response.data)
  );
}

async function checkForLiveGame(data: { puuid: string; region: string }) {
  const url = `${base}/check-for-live-game/`;
  const r = await axios.get(url, { params: data });
  return unwrap(
    t.union([SimpleSpectate, t.literal("not found")]).decode(r.data)
  );
}

async function getMatch(match_id: string) {
  const url = `${base}/${match_id}/`;
  const response = await axios.get(url);
  return unwrap(SimpleMatch.decode(response.data));
}

async function getMatchesByRiotIdName({
  riot_id_name,
  riot_id_tagline,
  region,
  queue,
  sync_import,
  playedWith,
  start = 0,
  limit = 10,
}: {
  riot_id_name: string;
  riot_id_tagline: string;
  region: string;
  sync_import?: boolean;
  playedWith?: string;
  start?: number;
  limit?: number;
  queue?: number | string;
}) {
  if (!riot_id_name || !region || !riot_id_tagline) {
    throw new Error("summoner and region required.");
  }
  const url = `${base}/by-summoner/${region}/${riot_id_name}/${riot_id_tagline}/`;
  const params = {
    start,
    limit,
    queue,
    playedWith,
    sync_import,
  };
  const response = await axios.get(url, { params });
  return unwrap(PaginatedResponse(BasicMatch).decode(response.data));
}

async function setRole(data: any) {
  const url = `${base}/participant/set-role/`;
  return await axios.post(url, data);
}

async function getLatestUnlabeled(data: any) {
  const url = `${base}/get-latest-unlabeled/`;
  return await axios.post(url, data);
}

async function bans(match_id: string) {
  const url = `${base}/${match_id}/bans/`;
  const response = await axios.get(url);
  return unwrap(PaginatedResponse(Ban).decode(response.data));
}

async function getMatchSummary(match_id: string) {
  const url = `${base}/${match_id}/summary/`;
  const response = await axios.get(url);
  return unwrap(MatchSummary.decode(response.data));
}

const exports = {
  timeline,
  participants,
  getSpectate,
  checkForLiveGame,
  getMatch,
  setRole,
  getLatestUnlabeled,
  bans,
  getMatchesByRiotIdName,
  getMatchSummary,
};

export default exports;
