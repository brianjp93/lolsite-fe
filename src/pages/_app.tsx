import { type AppType } from "next/app";
import { NextAdapter } from "next-query-params";
import { QueryParamProvider } from "use-query-params";
import { RecoilRoot } from "recoil";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <QueryParamProvider adapter={NextAdapter}>
      <RecoilRoot>
        <Component {...pageProps} />
      </RecoilRoot>
    </QueryParamProvider>
  );
};

export default trpc.withTRPC(MyApp);
