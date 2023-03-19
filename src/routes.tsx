export function profileRoute({
  region,
  name,
}: {
  region: string;
  name: string;
}) {
  return `/${region}/${name}/`;
}

export function signUpRoute() {
  return '/signup/'
}
