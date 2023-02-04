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

const exports = {
    demoLogin,
}
export default exports
