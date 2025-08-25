// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const remotePatterns = [
  {
    protocol: 'https',
    hostname: 'ddragon.leagueoflegends.com',
    pathname: '/**',
  },
  {
    protocol: 'https',
    hostname: 'raw.communitydragon.org',
    pathname: '/**',
  }
]
if (process.env.NODE_ENV === 'development') {
  remotePatterns.push({
    protocol: 'http',
    hostname: 'localhost',
    port: '8000',
    pathname: '/**',
  })
} else if (process.env.NODE_ENV === 'production') {
  remotePatterns.push({
    protocol: 'https',
    hostname: 'app.hardstuck.club',
    pathname: '/**',
  })
  remotePatterns.push({
    protocol: 'https',
    hostname: 'lolsite-static.s3-us-west-2.amazonaws.com',
    pathname: '/**',
  })
}
const config = {
  reactStrictMode: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    remotePatterns,
    unoptimized: true,
  },
  outputFileTracingRoot: '.',
};
export default config;
