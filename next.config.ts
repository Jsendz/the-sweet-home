import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// ─── Build-time environment variable validation ───────────────────────────────
// Only enforced in production builds so `next dev` still works without all
// variables filled in. Missing variables will throw a clear error at `next build`.

if (process.env.NODE_ENV === "production") {
  const required = [
    // Server-only (never sent to browser)
    "SANITY_API_TOKEN",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ALGOLIA_ADMIN_KEY",
    "RESEND_API_KEY",
    "HUBSPOT_API_KEY",
    "SANITY_WEBHOOK_SECRET",
    // Public (embedded in JS bundle — safe to expose)
    "NEXT_PUBLIC_SANITY_PROJECT_ID",
    "NEXT_PUBLIC_SANITY_DATASET",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_ALGOLIA_APP_ID",
    "NEXT_PUBLIC_ALGOLIA_SEARCH_KEY",
  ];

  const missing = required.filter((k) => !process.env[k]);

  if (missing.length > 0) {
    throw new Error(
      `\n\n❌ Missing required environment variables:\n  ${missing.join("\n  ")}\n\n` +
        `Copy .env.local.example to .env.local and fill in all values.\n`,
    );
  }
}

// ─── Next.js configuration ────────────────────────────────────────────────────

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — property images uploaded via Studio or API
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Sanity CDN — images managed through Sanity Studio
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/**",
      },
      // Unsplash — placeholder / mock images used in development
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
};

export default withNextIntl(nextConfig);
