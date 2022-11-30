import axios, { type AxiosRequestConfig } from "axios";
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
} from "../types";
import { env } from "@/env/client.mjs";

const version = "v1";
const base = `${env.NEXT_PUBLIC_BACKEND_URL}/api/${version}/player`;

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

async function getMyUser() {
  const url = `${base}/me/`;
  const response = await axios.get(url);
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

function getPositions(data: any) {
  const url = `${base}/positions/`;
  return axios.post(url, data);
}

function signUp(data: any) {
  const url = `${base}/sign-up/`;
  return axios.post(url, data);
}

function login(data: any) {
  const url = `${base}/login/`;
  return axios.post(url, data);
}

function verify(data: any) {
  const url = `${base}/verify/`;
  return axios.post(url, data);
}

function getChampionsOverview(data: any) {
  const url = `${base}/champions-overview/`;
  return axios.post(url, data);
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

function getFavorites() {
  const url = `${base}/favorites/`;
  return axios.get(url);
}

function Favorite(data: any) {
  const url = `${base}/favorites/`;
  return axios.post(url, data);
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

function getConnectedAccounts() {
  const url = `${base}/get-connected-accounts/`;
  return axios.post(url);
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
  Favorite,
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
};
export default exports;
