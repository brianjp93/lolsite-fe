import axios from 'axios';
import { env } from "@/env/client.mjs";

var version = 'v1';

axios.defaults.xsrfHeaderName = "X-CSRFToken";
axios.defaults.xsrfCookieName = "csrftoken";

const base = `${env.NEXT_PUBLIC_BACKEND_URL}/api/${version}`;

function demoLogin(data) {
    var url = `/api/${version}/general/demo-login/`
    return axios.post(url, data)
}

async function getCsrf() {
    let url = `${base}/get-csrf/`
    const response = await axios.get(url)
    return response.data
}

const exports = {
    demoLogin,
    getCsrf,
}
export default exports
