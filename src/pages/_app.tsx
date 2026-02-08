import type { AppType } from "next/app";
import { RecoilRoot } from "recoil";

import "../styles/globals.css";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <Head>
          <title>hardstuck.club</title>
        </Head>
        <Component {...pageProps} />
      </QueryClientProvider>
    </RecoilRoot>
  );
};

export default MyApp;
