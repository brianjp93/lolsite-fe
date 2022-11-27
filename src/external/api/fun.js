import { env } from "@/env/client.mjs";
import axios from "axios";

var version = "v1";

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

async function getInspirationalMessage() {
  const url = `${env.NEXT_PUBLIC_BACKEND_URL}/api/${version}/fun/inspirational-message/`;
  const response = await axios.get(url);
  return response.data;
}

const exports = {
  getInspirationalMessage,
};
export default exports;
