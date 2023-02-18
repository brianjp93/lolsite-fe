import axios from "axios";
import { env } from "@/env/client.mjs";
import { MetaHead } from "../iotypes/base";

const version = "v1";

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

const base = `${env.NEXT_PUBLIC_BACKEND_URL}/api/${version}`;

function demoLogin(data: any) {
  const url = `/api/${version}/general/demo-login/`;
  return axios.post(url, data);
}

async function getSummonerMetaData({
  name,
  region,
}: {
  name: string;
  region: string;
}) {
  const url = `${base}/summoner-metadata/${region}/${name}/`;
  const response = await axios.get(url);
  return MetaHead.parse(response.data);
}


async function getMatchMetaData({
  name,
  region,
  matchId,
}: {
  name: string;
  region: string;
  matchId: string;
}) {
  const url = `${base}/match-metadata/${region}/${name}/${matchId}/`;
  const response = await axios.get(url);
  return MetaHead.parse(response.data);
}

const exports = {
  demoLogin,
  getSummonerMetaData,
  getMatchMetaData,
};
export default exports;
