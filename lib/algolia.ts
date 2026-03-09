import { algoliasearch } from 'algoliasearch'
import type { Property, LocalizedString } from '@/types'

// ─── Environment helper ───────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

// ─── Client factories ─────────────────────────────────────────────────────────

/** Public search client — safe for browser bundles */
export function getAlgoliaSearchClient() {
  const appId = requireEnv('NEXT_PUBLIC_ALGOLIA_APP_ID')
  const searchKey = requireEnv('NEXT_PUBLIC_ALGOLIA_SEARCH_KEY')
  return algoliasearch(appId, searchKey)
}

/** Admin client — server-side only (uses secret API key) */
export function getAlgoliaAdminClient() {
  const appId = requireEnv('NEXT_PUBLIC_ALGOLIA_APP_ID')
  const adminKey = requireEnv('ALGOLIA_ADMIN_KEY')
  return algoliasearch(appId, adminKey)
}

// ─── Index name helper ────────────────────────────────────────────────────────

export const LOCALES = ['en', 'fr', 'es', 'ca'] as const
export type SupportedLocale = (typeof LOCALES)[number]

export function propertiesIndexName(locale: string): string {
  return `properties_${locale}`
}

// ─── Record type ──────────────────────────────────────────────────────────────

export type AlgoliaPropertyRecord = {
  objectID: string
  slug: string
  title: string
  description: string
  type: Property['type']
  status: Property['status']
  price: number
  priceLabel: string
  bedrooms: number
  bathrooms: number
  squareMeters: number
  city: string
  country: string
  images: string[]
  listedAt: string
  _geoloc: { lat: number; lng: number }
}

// ─── Resolve a LocalizedString to a single locale ────────────────────────────

function resolve(
  field: LocalizedString | string,
  locale: SupportedLocale,
): string {
  if (typeof field === 'string') return field
  return field[locale] ?? field.en ?? ''
}

// ─── Index a single property in all locale indexes ───────────────────────────

/**
 * Upserts one property into every locale-specific Algolia index.
 * Must be called server-side only (uses admin API key).
 */
export async function indexProperty(property: Property): Promise<void> {
  const client = getAlgoliaAdminClient()

  await Promise.all(
    LOCALES.map((locale) => {
      const record: AlgoliaPropertyRecord = {
        objectID: property.id,
        slug: property.slug,
        title: resolve(property.title, locale),
        description: resolve(property.description, locale),
        type: property.type,
        status: property.status,
        price: property.price,
        priceLabel: property.priceLabel,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareMeters: property.squareMeters,
        city: property.city,
        country: property.country,
        images: property.images,
        listedAt: property.listedAt,
        _geoloc: {
          lat: property.coordinates.lat,
          lng: property.coordinates.lng,
        },
      }

      return client.saveObject({
        indexName: propertiesIndexName(locale),
        body: record,
      })
    }),
  )
}

// ─── Remove a property from all locale indexes ───────────────────────────────

export async function deletePropertyFromIndex(propertyId: string): Promise<void> {
  const client = getAlgoliaAdminClient()

  await Promise.all(
    LOCALES.map((locale) =>
      client.deleteObject({
        indexName: propertiesIndexName(locale),
        objectID: propertyId,
      }),
    ),
  )
}
