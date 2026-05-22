import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  fallbacks: {
    document: "/offline"
  },
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/flights.*$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "flight-search-cache",
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 60 * 60 * 6
        }
      }
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/bookings.*$/i,
      handler: "StaleWhileRevalidate",
      options: {
        cacheName: "bookings-api-cache",
        expiration: {
          maxEntries: 40,
          maxAgeSeconds: 60 * 60 * 24
        }
      }
    },
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|webp|ico)$/i,
      handler: "CacheFirst",
      options: {
        cacheName: "image-assets",
        expiration: {
          maxEntries: 80,
          maxAgeSeconds: 60 * 60 * 24 * 30
        }
      }
    }
  ]
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true
  }
};

export default withPWA(nextConfig);
