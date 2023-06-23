import type { Favorite } from "@/external/types";
import { profileRoute } from "@/routes";
import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion";
import { useState } from "react";
import { useFavorites, useQueues, useSimpleSpectate, useSummoner } from "@/hooks";
import api from "@/external/api/api";
import { useMutation } from "@tanstack/react-query";

export function FavoriteList({
  favorites,
  onClick,
}: {
  favorites: Favorite[];
  onClick?: () => void;
}) {
  const favoritesQuery = useFavorites({});
  const [order, setOrder] = useState(favorites);

  const mutation = useMutation(
    (puuidList: string[]) => api.player.setFavoriteOrder(puuidList),
    {
      onSuccess: () => favoritesQuery.refetch(),
    }
  );

  const onReorder = (newOrder: Favorite[]) => {
    setOrder(newOrder);
  };

  return (
    <Reorder.Group axis="y" values={order} onReorder={onReorder}>
      {order.map((fav) => {
        return (
          <FavoriteItem
            onClick={onClick}
            key={fav.puuid}
            fav={fav}
            onPointerUp={() => mutation.mutate(order.map((x) => x.puuid))}
          />
        );
      })}
    </Reorder.Group>
  );
}

function FavoriteItem({
  fav,
  onPointerUp,
  onClick,
}: {
  fav: Favorite;
  onPointerUp: () => void;
  onClick?: () => void;
}) {
  const controls = useDragControls();
  const summoner = useSummoner({region: fav.region, name: fav.name}).data
  const spectate = useSimpleSpectate(summoner?._id || "", summoner?.region || "").data
  const queues = useQueues().data;
  let minutes = 0;
  let seconds = 0;
  let queue = "";
  if (spectate && spectate !== 'not found') {
    queue = queues?.[spectate?.gameQueueConfigId || -1]?.description || "";
    spectate?.gameStartTime
    const now = new Date().getTime();
    const ms = now - spectate?.gameStartTime || 0;
    const total_seconds = Math.round(ms / 1000);
    minutes = Math.floor(total_seconds / 60);
    seconds = total_seconds % 60;
  }

  return (
    <Reorder.Item
      dragListener={false}
      dragControls={controls}
      className="touch-none select-none"
      value={fav}
    >
      <div className="flex">
        <div
          onPointerUp={onPointerUp}
          className="my-auto cursor-grab"
          onPointerDown={(e) => controls.start(e)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 9h16.5m-16.5 6.75h16.5"
            />
          </svg>
        </div>
        <Link
          onClick={() => onClick && onClick()}
          href={profileRoute({
            region: fav.region,
            name: fav.name,
          })}
          className="flex px-2 py-1"
          key={`${fav.puuid}`}
        >
          <div className="mr-2 font-bold">{fav.region}</div>
          {spectate && spectate !== 'not found' &&
            <div className="flex h-full mr-1" title={`In game: ${queue} ${minutes}:${seconds}`}>
              <div className="rounded-full bg-green-600/70 border-green-400/70 border-2 h-3 w-3 my-auto"/>
            </div>
          }
          <div>{fav.name}</div>
        </Link>
      </div>
    </Reorder.Item>
  );
}
