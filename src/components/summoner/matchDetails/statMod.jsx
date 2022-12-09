import { getStatMod } from "@/utils/constants";
import clsx from "clsx";
import Image from "next/image";

export function StatModTable(props) {
  const participant = props.participant;
  const statmods = getStatMod("latest");

  const perk_0_order = [5008, 5005, 5007];
  const perk_1_order = [5008, 5002, 5003];
  const perk_2_order = [5001, 5002, 5003];
  const table_rows = [perk_0_order, perk_1_order, perk_2_order];

  return (
    <div>
      {table_rows.map((perks, perk_int) => {
        return (
          <div key={`${participant.summoner_name}-${perk_int}`}>
            {perks.map((perk_id, key) => {
              const perk = statmods[perk_id];
              const is_perk_selected =
                participant.stats[`stat_perk_${perk_int}`] === perk_id;
              return (
                <div
                  key={`${perk_id}-${key}`}
                  style={{ display: "inline-block" }}
                >
                  <div
                    data-tip={perk.name}
                    className={clsx("m-2 inline-block p-2", {
                      "rounded-full border-gray-400 border": is_perk_selected,
                    })}
                  >
                    <Image
                      height={30}
                      width={30}
                      className={clsx("align-bottom", {
                        "grayscale-[1]": !is_perk_selected,
                      })}
                      src={statmods[perk_id].image_url}
                      alt=""
                    />
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
