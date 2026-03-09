import { createClient } from '@sanity/client'

/**
 * Sanity client for data fetching inside Next.js pages and API routes.
 *
 * Required environment variables (add to .env.local):
 *   NEXT_PUBLIC_SANITY_PROJECT_ID  – your Sanity project ID
 *   NEXT_PUBLIC_SANITY_DATASET     – usually "production"
 *   SANITY_API_TOKEN               – read-token for server-side fetches (optional for public data)
 */

if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID')
}

if (!process.env.NEXT_PUBLIC_SANITY_DATASET) {
  throw new Error('Missing environment variable: NEXT_PUBLIC_SANITY_DATASET')
}

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-01-01', // Use today's date or later in production
  useCdn: process.env.NODE_ENV === 'production', // CDN for fast reads in prod
  token: process.env.SANITY_API_TOKEN,           // Optional: required for private datasets
})

/**
 * Helper that wraps client.fetch with Next.js App Router cache options.
 * Use `revalidate: 0` for real-time data, or a number of seconds for ISR.
 */
export async function sanityFetch<T>(
  query: string,
  params: Record<string, string | number | boolean> = {},
  revalidate: number | false = 60,
): Promise<T> {
  return client.fetch<T>(query, params, {
    next: { revalidate },
  })
}
