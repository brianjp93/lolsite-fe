import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import * as t from "io-ts";
import {
  PositionBin,
  unwrap,
  TopPlayedWithPlayer,
  Summoner,
  SummonerSearch,
  Reputation,
  User,
  NameChange,
  Favorite,
} from "../types";
import { env } from "@/env/client.mjs";
import {PlayerChampionSummaryResponse, Position} from "../iotypes/player";
import { z } from "zod";

const version = "v1";
const base = `${env.NEXT_PUBLIC_BACKEND_URL}/api/${version}/player`;

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.withCredentials = true;

async function getMyUser() {
  const url = `${base}/me/`;
  const response = await axios.get(url, {
    withCredentials: true
  });
  if (response.data.email) {
    return unwrap(User.decode(response.data));
  }
  return null;
}

function getSummoner(data: any) {
  const url = `${base}/summoner/`;
  return axios.post(url, data);
}

async function getSummonerByName(name: string, region: string) {
  const url = `${base}/summoner/${region}/by-name/${name}/`;
  const response = await axios.get(url);
  return unwrap(Summoner.decode(response.data));
}

interface GetSummonersData extends AxiosRequestConfig {
  puuids: string[];
  region: string;
}
async function getSummoners(data: GetSummonersData) {
  const url = `${base}/summoners/`;
  const r = await axios.post(url, data);
  return unwrap(t.array(Summoner).decode(r.data.data));
}

async function getPositions(data: any) {
  const url = `${base}/positions/`;
  const response = await axios.post(url, data);
  return unwrap(t.array(Position).decode(response.data.data))
}

function signUp({email, password}: {email: string, password: string}) {
  const data = {email, password}
  const url = `${base}/sign-up/`;
  return axios.post(url, data);
}

function verify(code: string) {
  const url = `${base}/verify/`;
  return axios.post(url, {code});
}

async function getChampionsOverview(data: any) {
  const url = `${base}/champions-overview/`;
  const response = await axios.get(url, {params: data});
  return z.object({
    count: z.number(),
    data: z.array(PlayerChampionSummaryResponse)
  }).parse(response.data)
}

async function summonerSearch(params: {
  simple_name__icontains: string;
  region: string;
  order_by?: string;
  start?: number;
  end?: number;
}) {
  const url = `${base}/summoner-search/`;
  const r = await axios.get(url, { params });
  return unwrap(t.array(SummonerSearch).decode(r.data.data));
}

function isLoggedIn() {
  const url = `${base}/is-logged-in/`;
  return axios.post(url);
}

interface GetRankHistoryData extends AxiosRequestConfig {
  id: number;
  queue: string;
  group_by?: "day" | "month" | "week";
  start?: string | null;
  end?: string | null;
}
async function getRankHistory(data: GetRankHistoryData) {
  const url = `${base}/rank-history/`;
  const response = await axios.post(url, data);
  return unwrap(t.array(PositionBin).decode(response.data.data));
}

async function getFavorites() {
  const url = `${base}/favorites/`;
  const response = await axios.get(url);
  return z.array(Favorite).parse(response.data.data)
}

async function setFavorite(summoner_id: number) {
  const url = `${base}/favorites/`;
  const response = await axios.post(url, {verb: 'set', summoner_id});
  return response.status
}

async function removeFavorite(summoner_id: number) {
  const url = `${base}/favorites/`;
  const response = await axios.post(url, {verb: 'remove', summoner_id});
  return response.status
}

async function setFavoriteOrder(favorites: string[]) {
  const url = `${base}/favorites/`
  const response = await axios.post(url, {verb: 'order', favorite_ids: favorites})
  return response.status
}

function generateCode(data: any) {
  const url = `${base}/generate-code/`;
  return axios.post(url, data);
}

function connectAccount(data: any) {
  const url = `${base}/connect-account/`;
  return axios.post(url, data);
}

function connectAccountWithProfileIcon(data: any) {
  const url = `${base}/connect-account-with-profile-icon/`;
  return axios.post(url, data);
}

async function getConnectedAccounts() {
  const url = `${base}/get-connected-accounts/`;
  const response = await axios.get(url);
  return unwrap(t.array(Summoner).decode(response.data.data))
}

function changePassword(data: any) {
  const url = `${base}/change-password/`;
  return axios.post(url, data);
}

interface GetTopPlayedWithData extends AxiosRequestConfig {
  summoner_id?: number | null;
  account_id?: string | null;
  group_by?: "summoner_name" | "puuid" | null;
  season_id?: number | null;
  queue_id?: number | null;
  recent?: number | null;
  recent_days?: number | null;
  start?: number | null;
  end?: number | null;
}
async function getTopPlayedWith(data: GetTopPlayedWithData) {
  const url = `${base}/get-top-played-with/`;
  const r = await axios.post(url, data);
  return unwrap(t.array(TopPlayedWithPlayer).decode(r.data.data));
}

function getComments(data: any) {
  const url = `${base}/comment/`;
  return axios.get(url, { params: data });
}

function getReplies(data: any) {
  const url = `${base}/comment/replies/`;
  return axios.get(url, { params: data });
}

function createComment(data: any) {
  const url = `${base}/comment/`;
  return axios.post(url, data);
}

function deleteComment(data: any) {
  const url = `${base}/comment/`;
  return axios.delete(url, { data });
}

function likeComment(data: any) {
  const url = `${base}/comment/like/`;
  return axios.put(url, data);
}

function dislikeComment(data: any) {
  const url = `${base}/comment/dislike/`;
  return axios.put(url, data);
}

function getCommentCount(data: any) {
  const url = `${base}/comment/count/`;
  return axios.get(url, { params: data });
}

function editDefaultSummoner(data: any) {
  const url = `${base}/default-summoner/`;
  return axios.post(url, data);
}

async function getReputation(summoner: number) {
  const url = `${base}/reputation/${summoner}/`;
  const r = await axios.get(url);
  return unwrap(Reputation.decode(r.data));
}

async function createReputation(summoner: number, is_approve: boolean) {
  const url = `${base}/reputation/create/`;
  const r = await axios.post(url, { summoner, is_approve });
  return unwrap(Reputation.decode(r.data));
}

async function updateReputation(
  id: number,
  summoner: number,
  is_approve: boolean
) {
  const url = `${base}/reputation/update/${id}/`;
  const r = await axios.put(url, { is_approve, summoner });
  return unwrap(Reputation.decode(r.data));
}

async function getNameChanges(id: number) {
  const url = `${base}/summoner/${id}/name-changes/`;
  const r = await axios.get(url);
  return unwrap(t.array(NameChange).decode(r.data.results));
}

async function login({email, password}: {email: string, password: string}) {
  const url = `${base}/login/`
  const response = await axios.post(url, {
    email,
    password,
  })
  return response.data
}

async function logout() {
  const url = `${base}/logout/`
  const response = await axios.post(url)
  return response.status
}

const exports = {
  getSummoner,
  getSummonerByName,
  getSummoners,
  getPositions,
  signUp,
  login,
  verify,
  getChampionsOverview,
  summonerSearch,
  isLoggedIn,
  getRankHistory,
  getFavorites,
  setFavorite,
  removeFavorite,
  generateCode,
  connectAccount,
  connectAccountWithProfileIcon,
  getConnectedAccounts,
  changePassword,
  getTopPlayedWith,
  getComments,
  getReplies,
  createComment,
  deleteComment,
  likeComment,
  dislikeComment,
  getCommentCount,
  editDefaultSummoner,
  getReputation,
  createReputation,
  updateReputation,
  getMyUser,
  getNameChanges,
  logout,
  setFavoriteOrder,
};
export default exports;
