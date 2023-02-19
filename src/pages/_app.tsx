import type { AppType } from "next/app";
import { NextAdapter } from "next-query-params";
import { QueryParamProvider } from "use-query-params";
import { RecoilRoot } from "recoil";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <QueryParamProvider adapter={NextAdapter}>
      <RecoilRoot>
        <Head>
          <title>hardstuck.club</title>
        </Head>
        <Component {...pageProps} />
      </RecoilRoot>
    </QueryParamProvider>
  );
};

export default trpc.withTRPC(MyApp);
