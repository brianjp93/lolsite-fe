import { mediaUrl } from "@/components/utils";
import type { NameChangeType, PositionType } from "@/external/iotypes/player";
import type { SummonerType } from "@/external/types";
import {
  useFavorites,
  useNameChanges,
  usePositions,
  useQueues,
  useSpectate,
  useSummoner,
  useUser,
} from "@/hooks";
import Image from "next/image";
import { useRouter } from "next/router";
import { Popover } from "react-tiny-popover";
import { useState } from "react";
import { QUEUE_CONVERT } from "@/utils/constants";
import numeral from "numeral";
import api from "@/external/api/api";
import { useMutation } from "@tanstack/react-query";
import { SpectateModal } from "../spectate";
import { UsersIcon } from "@/components/icons";
import { InGameDot } from "@/components/general/favoriteList";
import clsx from "clsx";

export function ProfileCard({ className = "" }: { className: string }) {
  const router = useRouter();
  const { searchName, region } = router.query as {
    searchName: string;
    region: string;
  };
  const summonerQ = useSummoner({ region, name: searchName });
  const summoner = summonerQ.data;
  const positionQ = usePositions({ summoner_id: summoner?._id || "", region });
  const positions = positionQ.data;
  const nameChangeQuery = useNameChanges(summoner?.id || 0);
  const nameChanges = nameChangeQuery.data || [];
  if (!summoner) return null;
  return (
    <div className={className}>
      <ProfileCardInner
        summoner={summoner}
        positions={positions}
        nameChanges={nameChanges}
      />
    </div>
  );
}

export function FavoriteButton({ summoner }: { summoner: SummonerType }) {
  const user = useUser().data;
  const favoritesQuery = useFavorites({ enabled: !!user });
  const favorites = favoritesQuery.data || [];
  const isFavorite = !!favorites.filter((x) => x.puuid === summoner.puuid)?.[0];

  const setFavorite = useMutation(() => api.player.setFavorite(summoner.id), {
    onSuccess: () => {
      favoritesQuery.refetch();
    },
  });
  const removeFavorite = useMutation(
    () => api.player.removeFavorite(summoner.id),
    {
      onSuccess: () => {
        favoritesQuery.refetch();
      },
    }
  );

  if (!user) {
    return null;
  }

  return (
    <div>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill={isFavorite ? "currentColor" : "none"}
        onClick={
          isFavorite
            ? () => removeFavorite.mutate()
            : () => setFavorite.mutate()
        }
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6 hover:cursor-pointer"
        tabIndex={1}
        role="button"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </div>
  );
}

export function ProfileCardInner({
  summoner,
  positions = [],
  nameChanges = [],
}: {
  summoner: SummonerType;
  positions?: PositionType[];
  nameChanges?: NameChangeType[];
}) {
  const [isNameChangeOpen, setIsNameChangeOpen] = useState(false);
  const [isSpectateModalOpen, setIsSpectateModalOpen] = useState(false);

  const spectateQuery = useSpectate(
    summoner.region,
    summoner?._id,
    1000 * 60,
    !!summoner?._id
  );
  const spectate = spectateQuery.data;
  const queues = useQueues().data || {};

  return (
    <div className="flex max-w-fit flex-col rounded bg-zinc-900 p-4 shadow-lg">
      <div className="flex">
        <div className="relative w-fit">
          <Image
            src={mediaUrl(summoner.profile_icon)}
            alt={`Summoner Icon: ${summoner.profile_icon_id}`}
            width={40}
            height={40}
            className="rounded"
          />
          <div className="absolute bottom-[-7px] flex w-full">
            <div className="mx-auto rounded-md bg-zinc-200 px-1 text-xs font-bold text-gray-900">
              {summoner.summoner_level}
            </div>
          </div>
        </div>
        <div className="ml-2 mr-4">
          <div className="flex">
            <div>
              <Popover
                isOpen={isNameChangeOpen}
                positions={["bottom"]}
                containerStyle={{ zIndex: "11" }}
                content={
                  <div>
                    <h1 className="underline">Old Names</h1>
                    {nameChanges.map((item, key) => {
                      return <div key={key}>{item.old_name}</div>;
                    })}
                  </div>
                }
              >
                <div
                  onClick={() => setIsNameChangeOpen((x) => !x)}
                  className="cursor-pointer font-bold underline"
                >
                  {summoner.name}
                </div>
              </Popover>
              {spectate ? (
                <SpectateModal
                  region={summoner.region}
                  summoner_id={summoner._id}
                  queueConvert={queues}
                  isSpectateModalOpen={isSpectateModalOpen}
                  setIsSpectateModalOpen={setIsSpectateModalOpen}
                >
                  <div className="flex text-sm hover:cursor-pointer">
                    <div>
                      <InGameDot
                        queueId={spectate.gameQueueConfigId}
                        startTime={spectate.gameStartTime}
                      />
                    </div>
                    Live Game
                  </div>
                </SpectateModal>
              ) : (
                <div className="text-sm">Not in game</div>
              )}
            </div>
            {summoner.has_match_overlap > 0 && (
              <div
                title={`Your connected accounts have ${summoner.has_match_overlap} overlapping games with this account.`}
                className="ml-2 mt-1"
              >
                <div className="relative">
                  <UsersIcon className="my-auto w-6" />
                  <div className="absolute -top-3 -right-4 rounded-sm bg-gray-600 px-1 text-xs">
                    {summoner.has_match_overlap}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="ml-auto">
          <FavoriteButton summoner={summoner} />
        </div>
      </div>
      <div className="mt-2">
        {positions.map((x) => {
          const queue = QUEUE_CONVERT[x.queue_type] || x.queue_type;
          const total = x.wins + x.losses || 1;
          const percentage = numeral(x.wins / total).format("0.0%");
          return (
            <div key={x.id}>
              <div className="mt-1 flex">
                <div className="mr-3">
                  <div className="font-bold">{queue}:</div>
                </div>
                <div className="ml-auto mr-3">
                  {x.tier} {x.rank} {x.league_points}LP
                </div>
                {x.series_progress &&
                <div className="flex mr-3">
                  {[...x.series_progress].map((ch: string, key: number) => {
                      return (
                        <div
                          className={clsx(
                            "my-auto h-3 w-3 rounded-full border-2",
                            {
                              "border-green-900 bg-green-600": ch === "W",
                              "border-red-900 bg-red-600": ch === "L",
                              "border-gray-700": ch === "N",
                            }
                          )}
                          key={key}
                        ></div>
                      );
                    })}
                </div>
                }
                <div className="ml-auto flex">
                  {x.wins}/{x.losses}
                  <div className="ml-2 font-bold">{percentage}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
