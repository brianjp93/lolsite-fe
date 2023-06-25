export function profileRoute({
  region,
  name,
  playedWith,
}: {
  region: string;
  name: string;
  playedWith?: string;
}) {
  const url = `/${region}/${name}/`;
  const params = new URLSearchParams();
  if (playedWith) {
    params.append('playedWith', playedWith)
  }
  return url + params.toString()
}

export function signUpRoute() {
  return '/signup/'
}

export function itemsRoute() {
  return "/items"
}
