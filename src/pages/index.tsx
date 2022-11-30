import Skeleton from "@/components/general/skeleton";
import { useQuery } from "@tanstack/react-query";
import { type NextPage } from "next";
import api from "@/external/api/api";
import Modal from "react-modal";
import {SearchForm} from "@/components/general/searchForm";

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


export default Home;
