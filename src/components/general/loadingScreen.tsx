import Orbit from "./spinner";

export function LoadingScreen() {
  return <div
    className="bg-zinc-950/50 fixed inset-0 z-50 grid place-items-center"
    role="status"
    aria-label="Loading page"
  >
    <Orbit size={100} />
  </div>;
}
