import Skeleton from "@/components/general/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { NextPage } from "next";
import api from "@/external/api/api";
import Modal from "react-modal";
import { SearchForm } from "@/components/general/searchForm";
import Image from "next/image";

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
  const quote = quoteQuery.data?.message;
  return (
    <Skeleton>
      <div className="mx-auto max-w-prose">
        <Image
          className="m-auto mt-8"
          src="/gen/hardstuck-by-hand_2.png"
          alt="Hardstuck large logo."
          width={500}
          height={300}
        />
        <div className="mt-4" title={quote?.hidden_message}>
          {quote?.message}
          {quote?.author &&
            <div className="ml-4 opacity-60">
              - {quote?.author}
            </div>
          }
        </div>
        <SearchForm formClass="mt-10" />
      </div>
    </Skeleton>
  );
};

export default Home;
