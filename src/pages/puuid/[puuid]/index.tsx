import api from "@/external/api/api";
import { profileRoute } from "@/routes";
import axios from "axios";
import type { GetServerSideProps } from "next";

export default function PuuidPage() {
  return null;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const puuid = params?.puuid;
  if (typeof puuid !== "string") return { notFound: true };

  try {
    const summoner = await api.player.getSummoner({ puuid });
    return {
      redirect: {
        destination: profileRoute({
          region: summoner.region,
          riotIdName: summoner.riot_id_name,
          riotIdTagline: summoner.riot_id_tagline,
        }),
        permanent: false,
      },
    };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { notFound: true };
    }
    throw error;
  }
};
