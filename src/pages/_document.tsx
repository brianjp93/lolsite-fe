import { env } from "@/env/client.mjs";
import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
  return (
    <Html>
      <Head>
        <link rel="shortcut icon" type="image/png" href="/gen/logo-clean.png" />
        <Script
          id="ga4-script"
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${env.NEXT_PUBLIC_MEASUREMENT_ID}`}
        >
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${env.NEXT_PUBLIC_MEASUREMENT_ID}');
        `}
        </Script>
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
