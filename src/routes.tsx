export function profileRoute({
  region,
  riotIdName,
  riotIdTagline,
  playedWith,
}: {
  region: string;
  riotIdName: string;
  riotIdTagline: string;
  playedWith?: string;
}) {
  const url = `/${region}/${riotIdName}-${riotIdTagline}/`;
  const params = new URLSearchParams();
  if (playedWith) {
    params.append('playedWith', playedWith)
  }
  return url + params.toString()
}

export function myAccount() {
  return '/account/'
}

export function signUpRoute() {
  return '/signup/'
}

export function itemsRoute() {
  return "/items/"
}

export function puuidRoute(puuid: string, region: string) {
  return `/${region}/puuid/${puuid}/`
}
