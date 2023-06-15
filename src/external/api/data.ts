import axios from "axios";
import {
  unwrap,
  Rune,
  BasicChampionWithImage,
  PaginatedResponse,
} from "@/external/types";
import { Queue } from "../iotypes/data";
import * as t from "io-ts";
import { env } from "@/env/client.mjs";
import { z } from "zod";

const version = "v1";
const base = `${env.NEXT_PUBLIC_BACKEND_URL}/api/${version}/data`;

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

async function getQueues() {
  const url = `${base}/queues/`;
  const response = await axios.get(url);
  return z.array(Queue).parse(response.data);
}

function getItem(data: any) {
  const url = `${base}/item/`;
  return axios.post(url, data);
}

function getSimpleItem(
  _id: number,
  major: number | string,
  minor: number | string
) {
  const url = `${base}/item/${_id}/${major}/${minor}/`;
  return axios.get(url);
}

function items(data: any) {
  const url = `${base}/items/`;
  return axios.post(url, data);
}

async function getRunes(data: any) {
  const url = `${base}/reforged-runes/`;
  const response = await axios.post(url, data);
  return unwrap(t.array(Rune).decode(response.data.data));
}

function getCurrentSeason() {
  const url = `${base}/get-current-season/`;
  return axios.post(url);
}

async function getChampions(data?: any) {
  const url = `${base}/champions/`;
  return axios.post(url, data);
}

function getChampionSpells(data: any) {
  const url = `${base}/champion-spells/`;
  return axios.post(url, data);
}

async function basicChampions() {
  const url = `${base}/basic-champions/`;
  const response = await axios.get(url);
  return unwrap(
    PaginatedResponse(BasicChampionWithImage).decode(response.data)
  );
}

async function getStaticUrl() {
  const url = `${base}/get-static-url/`;
  const response = await axios.get(url);
  return unwrap(t.string.decode(response.data));
}

async function getMediaUrl() {
  const url = `${base}/get-media-url/`;
  const response = await axios.get(url);
  return unwrap(t.string.decode(response.data));
}

const exports = {
  getItem,
  getSimpleItem,
  getRunes,
  items,
  getCurrentSeason,
  getChampions,
  getChampionSpells,
  basicChampions,
  getStaticUrl,
  getMediaUrl,
  getQueues,
};
export default exports;
