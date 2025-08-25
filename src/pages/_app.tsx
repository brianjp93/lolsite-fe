import type { AppType } from "next/app";
import { NextAdapter } from "next-query-params";
import { QueryParamProvider } from "use-query-params";
import { RecoilRoot } from "recoil";

import "../styles/globals.css";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <QueryParamProvider adapter={NextAdapter}>
      <RecoilRoot>
        <QueryClientProvider client={queryClient}>
          <Head>
            <title>hardstuck.club</title>
          </Head>
          <Component {...pageProps} />
        </QueryClientProvider>
      </RecoilRoot>
    </QueryParamProvider>
  );
};

export default MyApp;
