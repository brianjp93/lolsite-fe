import Skeleton from "@/components/general/skeleton";
import { useQuery } from "@tanstack/react-query";
import { type NextPage } from "next";
import api from "@/external/api/api";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGIONS } from "@/utils/constants";
import { useRouter } from "next/router";
import { ErrorField } from "@/components/utils";
import Modal from "react-modal";

Modal.setAppElement("#__next");

const Home: NextPage = () => {
  const quoteQuery = useQuery(
    ["inspirational-quote"],
    () => api.fun.getInspirationalMessage(),
    {
      refetchInterval: 1000 * 5,
      refetchOnWindowFocus: false,
    }
  );
  return (
    <Skeleton>
      <div className="mx-auto max-w-prose">
        <h1>HARDSTUCK CLUB</h1>
        <div className="mt-4">{quoteQuery.data?.message?.message}</div>
        <div className="mt-10">
          <SearchForm />
        </div>
      </div>
    </Skeleton>
  );
};

const SearchSchema = z.object({
  search: z.string().min(1, "Please give a summoner name."),
  region: z.enum(REGIONS),
});
type SearchSchema = z.infer<typeof SearchSchema>;

export function SearchForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchSchema>({
    resolver: zodResolver(SearchSchema),
  });
  const router = useRouter();
  return (
    <form
      onSubmit={handleSubmit((data) => {
        router.push(`/${data.region}/${data.search}/`);
      })}
    >
      <label htmlFor="">Search</label>
      <div className="flex">
        <select {...register("region")}>
          {REGIONS.map((item) => {
            return (
              <option key={item} value={item}>
                {item}
              </option>
            );
          })}
        </select>
        <input type="text" className="w-full" {...register("search")} />
        <ErrorField message={errors.search?.message} />
        <ErrorField message={errors.region?.message} />
      </div>
      <button className="btn btn-primary mt-2 w-full">Search</button>
    </form>
  );
}

export default Home;
