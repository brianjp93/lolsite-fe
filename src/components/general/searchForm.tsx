import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGIONS } from "@/utils/constants";
import { useRouter } from "next/router";
import { useSummonerSearch } from "@/hooks";
import clsx from "clsx";
import type { SummonerType } from "@/external/types";

const SearchSchema = z.object({
  search: z.string().min(1, "Please give a summoner name."),
  region: z.enum(REGIONS),
});
type SearchSchema = z.infer<typeof SearchSchema>;

export function SearchForm({
  showButton = true,
  showLabel = true,
  inputClass = "",
  formClass = "",
}: {
  showButton?: boolean;
  showLabel?: boolean;
  inputClass?: string;
  formClass?: string;
}) {
  const { register, handleSubmit, setValue, watch } = useForm<SearchSchema>({
    resolver: zodResolver(SearchSchema),
  });
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const name = watch("search") || "";
  const region = watch("region") || "na";
  const query = useSummonerSearch({
    name,
    region,
  });
  const ref = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (name.length >= 3) {
      setIsOpen(true);
    }
  }, [name]);

  useEffect(() => {
    if (name.length < 3) {
      setIsOpen(false);
    }
  }, [name]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (event.target instanceof Element) {
        if (!ref?.current?.contains(event.target)) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // close dropdown after name selection
  useEffect(() => {
    const handleRouteChange = () => {
      setIsOpen(false);
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => router.events.off("routeChangeComplete", handleRouteChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = handleSubmit((data) => {
    let search = data.search
    if (data.search.indexOf("#") < 0) {
      search = search + '-NA1'
    } else {
      search = search.replace("#", "-")
    }
    router.push(`/${data.region}/${search}/`);
  });

  const handleSelect = (x: SummonerType) => {
    setValue("search", `${x.riot_id_name}#${x.riot_id_tagline}`);
    onSubmit();
  };

  return (
    <form
      className={formClass}
      ref={formRef}
      autoComplete="off"
      onSubmit={onSubmit}
    >
      {showLabel && <label htmlFor="">Search</label>}
      <div ref={ref} className="relative flex">
        <select {...register("region")}>
          {REGIONS.map((item) => {
            return (
              <option key={item} value={item}>
                {item}
              </option>
            );
          })}
        </select>
        <input
          onFocus={() => {
            if (query.data) setIsOpen(true);
          }}
          type="text"
          placeholder="gameName#tagline"
          className={clsx("w-full", inputClass)}
          {...register("search")}
        />
        {isOpen && (
          <div className="absolute left-0 bottom-0 h-0 w-full">
            <div
              className={clsx(
                "mt-1 max-h-80 w-full overflow-y-auto rounded",
                "bg-gradient-to-tr from-slate-900/80 quiet-scroll",
                "via-slate-900/90 to-zinc-900/80 p-3 shadow-md",
              )}
            >
              {query.isSuccess &&
                query.data.map((x) => {
                  return (
                    <div
                      tabIndex={0}
                      role="button"
                      onClick={() => handleSelect(x)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          handleSelect(x);
                        }
                      }}
                      className="flex h-fit w-full items-center rounded py-1 hover:cursor-pointer hover:bg-white/10"
                      key={x.puuid}
                    >
                      <div className="h-full w-16">
                        <div className="mr-3 rounded border border-gray-300 px-0 py-1 text-center">
                          {x.summoner_level}
                        </div>
                      </div>
                      <div className="">{x.riot_id_name}#{x.riot_id_tagline}</div>
                    </div>
                  );
                })}
              {query.isSuccess && query.data.length === 0 && (
                <div>No results found.</div>
              )}
            </div>
          </div>
        )}
      </div>
      {showButton && (
        <button className="btn btn-primary mt-2 w-full">Search</button>
      )}
    </form>
  );
}
