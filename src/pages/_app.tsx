import type { AppType } from "next/app";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { RecoilRoot } from "recoil";

import "../styles/globals.css";
import Orbit from "@/components/general/spinner";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
        {isNavigating && (
          <div
            className="bg-zinc-950/50 fixed inset-0 z-50 grid place-items-center"
            role="status"
            aria-label="Loading page"
          >
            <Orbit size={100} />
          </div>
        )}
        <Component {...pageProps} />
      </QueryClientProvider>
    </RecoilRoot>
  );
};

export default MyApp;
