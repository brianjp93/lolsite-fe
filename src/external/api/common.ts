export function getCookie(key: string) {
  const b = document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");
  return b ? b.pop() : "";
}

export function get_default_headers() {
  return {headers: {"X-CSRFToken": getCookie('csrftoken')}}
}
