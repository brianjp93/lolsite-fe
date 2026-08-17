import type { AppType } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { RecoilRoot } from "recoil";

import "../styles/globals.css";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LoadingScreen } from "@/components/general/loadingScreen";

const queryClient = new QueryClient();

const MyApp: AppType = ({ Component, pageProps }) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    const start = (_url: string, { shallow }: { shallow: boolean }) => {
      if (!shallow) setIsNavigating(true);
    };
    const stop = () => setIsNavigating(false);

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", stop);
    router.events.on("routeChangeError", stop);
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", stop);
      router.events.off("routeChangeError", stop);
    };
  }, [router.events]);

  return (
    <RecoilRoot>
      <QueryClientProvider client={queryClient}>
        <Head>
          <title>hardstuck.club</title>
        </Head>
        {isNavigating && <LoadingScreen />}
        <Component {...pageProps} />
      </QueryClientProvider>
    </RecoilRoot>
  );
};

export default MyApp;
