import { useBasicChampions, usePlayerSummary, useQueues } from "@/hooks";
import type { PlayerChampionSummaryResponse } from "@/external/iotypes/player";
import Orbit from "@/components/general/spinner";
import Image from "next/image";
import { mediaUrl } from "../utils";
import numeral from "numeral";
import { useState } from "react";
import clsx from "clsx";
import { subDays, startOfDay } from "date-fns";

type Timing = "30 days" | "60 days" | "season";

export function PlayerChampionSummary({ puuid }: { puuid: string }) {
  const [isShowAll, setIsShowAll] = useState(false);

  const [timing, setTiming] = useState<Timing>("30 days");
  const [season, setSeason] = useState<number>(13);
  const [queue, setQueue] = useState<undefined|number>(420);

  const today = startOfDay(Date.now());

  let options;
  switch (timing) {
    case "30 days": {
      options = { start_datetime: subDays(today, 30) };
      break;
    }
    case "60 days": {
      options = { start_datetime: subDays(today, 60) };
      break;
    }
    case "season": {
      options = { season: season };
      break;
    }
  }

  const currentSeason = 13;

  const query = usePlayerSummary({
    puuid,
    end: isShowAll ? 1000 : 5,
    queue_in: queue ? [queue]: undefined,
    ...options,
  });
  const summaries = query.data;
  if (query.isLoading) {
    return <Orbit />;
  } else if (!summaries) {
    return <>No data found</>;
  }
  return (
    <div>
      <div className="flex">
        <label className="hover:cursor-pointer">
          <input
            className="mr-2 inline hover:cursor-pointer"
            type="radio"
            checked={timing === "30 days"}
            onChange={(event) => {
              if (event.currentTarget.checked) {
                setTiming("30 days");
              }
            }}
          />
          30 days
        </label>

        <label className="ml-4 hover:cursor-pointer">
          <input
            className="mr-2 inline hover:cursor-pointer"
            type="radio"
            checked={timing === "60 days"}
            onChange={(event) => {
              if (event.currentTarget.checked) {
                setTiming("60 days");
              }
            }}
          />
          60 days
        </label>

        {[currentSeason, currentSeason - 1, currentSeason - 2].map(
          (seasonChoice) => {
            return (
              <label key={seasonChoice} className="ml-4 hover:cursor-pointer">
                <input
                  className="mr-2 inline hover:cursor-pointer"
                  type="radio"
                  checked={timing === "season" && season == seasonChoice}
                  onChange={(event) => {
                    if (event.currentTarget.checked) {
                      setTiming("season");
                      setSeason(seasonChoice);
                    }
                  }}
                />
                Season {seasonChoice}
              </label>
            );
          }
        )}
      </div>
      <div className="flex">
        <label className="hover:cursor-pointer">
          <input
            className="mr-2 inline hover:cursor-pointer"
            type="radio"
            checked={queue === 420}
            onChange={(event) => {
              if (event.currentTarget.checked) {
                setQueue(420);
              }
            }}
          />
          Solo/Duo Queue
        </label>
        <label className="ml-4 hover:cursor-pointer">
          <input
            className="mr-2 inline hover:cursor-pointer"
            type="radio"
            checked={queue === 440}
            onChange={(event) => {
              if (event.currentTarget.checked) {
                setQueue(440);
              }
            }}
          />
          Flex Queue
        </label>
        <label className="ml-4 hover:cursor-pointer">
          <input
            className="mr-2 inline hover:cursor-pointer"
            type="radio"
            checked={queue === undefined}
            onChange={(event) => {
              if (event.currentTarget.checked) {
                setQueue(undefined);
              }
            }}
          />
          All
        </label>
      </div>
      <div className="flex max-h-96 flex-wrap justify-around overflow-y-scroll mt-2">
        <PlayerChampionSummaryDisplay summaries={summaries.data} />
      </div>
      {!isShowAll && summaries.count > summaries.data.length && (
        <div>
          <button
            onClick={() => setIsShowAll(true)}
            className="btn btn-link w-full"
          >
            View All
          </button>
        </div>
      )}
    </div>
  );
}

function PlayerChampionSummaryDisplay({
  summaries,
}: {
  summaries: PlayerChampionSummaryResponse[];
}) {
  return (
    <>
      {summaries.map((summary) => {
        return (
          <div key={`${summary.champion_id}-${summary.count}`} className="my-1">
            <PlayerChampionSummaryItem summary={summary} />
          </div>
        );
      })}
    </>
  );
}

function PlayerChampionSummaryItem({
  summary,
}: {
  summary: PlayerChampionSummaryResponse;
}) {
  const champions = useBasicChampions();
  const champ = champions[summary.champion_id];
  const leftColStyle = "text-right mr-2";

  const winPercentage =
    (summary.wins / (summary.wins + summary.losses || 1)) * 100;
  const lossPercentage =
    (summary.losses / (summary.wins + summary.losses || 1)) * 100;

  return (
    <div className="h-full w-44 rounded-md border-2 border-solid border-zinc-600">
      <div className="flex">
        {champ && (
          <Image
            className="h-full rounded-md"
            width={40}
            height={40}
            src={mediaUrl(champ.image.file_40)}
            alt={champ.name}
          />
        )}
        <div className="w-full">
          <div
            className="ml-2 overflow-x-hidden font-bold"
            title={summary.champion}
          >
            {summary.champion}
          </div>
          <div className="ml-2 text-sm">
            <div className="mr-1 inline font-bold">{summary.count}</div>
            games
          </div>
        </div>
      </div>

      <div className="flex h-4 w-full">
        <div
          style={{ width: `${winPercentage}%` }}
          title={`${numeral(winPercentage).format("0.0")}% win rate`}
          className={clsx(
            "h-full rounded-l-md bg-gradient-to-r from-green-700/50 to-green-400/70",
            {
              "rounded-r-md": winPercentage === 100,
            }
          )}
        ></div>
        <div
          style={{ width: `${lossPercentage}%` }}
          title={`${numeral(lossPercentage).format("0.0")}% loss rate`}
          className={clsx(
            "h-full rounded-r-md bg-gradient-to-r from-red-400/70 to-red-700/70",
            {
              "rounded-l-md": lossPercentage === 100,
            }
          )}
        ></div>
      </div>

      <div className="mx-1 grid w-full grid-cols-2 text-sm">
        <div className={leftColStyle}>K/D/A</div>
        <div>{numeral(summary.kda).format("0.00")}</div>

        <div className={leftColStyle}>GPM</div>
        <div>{numeral(summary.gpm).format("0.00")}</div>

        <div className={leftColStyle}>VSPM</div>
        <div>{numeral(summary.vspm).format("0.00")}</div>

        <div className={leftColStyle}>DPM</div>
        <div>{numeral(summary.dpm).format("0.00")}</div>

        <div className={leftColStyle}>DTPM</div>
        <div>{numeral(summary.dtpm).format("0.00")}</div>

        <div className={leftColStyle}>DTPD</div>
        <div>{numeral(summary.dtpd).format("0.00")}</div>

        <div className={leftColStyle}>Turret DPM</div>
        <div>{numeral(summary.turret_dpm).format("0.00")}</div>

        <div className={leftColStyle}>Obj DPM</div>
        <div>{numeral(summary.objective_dpm).format("0.00")}</div>
      </div>
    </div>
  );
}
