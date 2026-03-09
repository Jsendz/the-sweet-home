import type { Property } from '@/types'
import type { PropertyCardProps } from '@/components/properties/PropertyCard'

// ─── Locale resolver ──────────────────────────────────────────────────────────
// Handles both LocalizedString objects (from mockData) and plain strings
// (from Sanity GROQ, which coalesces localized fields before returning).

export function loc(field: unknown, locale: string): string {
  if (typeof field === 'string') return field
  if (field && typeof field === 'object') {
    const obj = field as Record<string, string>
    return obj[locale] ?? obj['en'] ?? ''
  }
  return ''
}

// ─── Property → PropertyCardProps mapper ─────────────────────────────────────

function resolveStatus(
  type: string,
  status: string,
): PropertyCardProps['status'] {
  if (status === 'sold') return 'Sold'
  if (status === 'rented') return 'Sold'
  if (type === 'residential_rental' || type === 'commercial') return 'For Rent'
  return 'For Sale'
}

function resolveType(type: string): PropertyCardProps['type'] {
  const map: Record<string, PropertyCardProps['type']> = {
    residential_sale: 'House',
    residential_rental: 'Apartment',
    commercial: 'Commercial',
    luxury: 'Villa',
  }
  return map[type] ?? 'House'
}

export function toCardProps(p: Property, locale: string): PropertyCardProps {
  // priceLabel from mockData is "€4,500 / month" — split into price + label
  const hasMonthSuffix = p.priceLabel.includes(' / month')
  const cardPrice = hasMonthSuffix
    ? p.priceLabel.replace(' / month', '')
    : p.priceLabel
  const cardPriceLabel = hasMonthSuffix ? '/ month' : undefined

  return {
    slug: p.slug,
    image: (p.images[0] as string) || '',
    status: resolveStatus(p.type, p.status),
    type: resolveType(p.type),
    title: loc(p.title, locale),
    address: `${p.address}, ${p.city}`,
    price: cardPrice,
    priceLabel: cardPriceLabel,
    beds: p.bedrooms,
    baths: p.bathrooms,
    sqm: p.squareMeters,
    agentName: p.agent.name,
    agentAvatar: p.agent.photo,
  }
}

// ─── Safe Sanity fetchers (dynamic import to survive missing env vars) ────────

export async function safeGetFeaturedProperties(locale: string): Promise<Property[]> {
  try {
    const { getFeaturedProperties } = await import('@/sanity/lib/queries')
    return (await getFeaturedProperties(locale)) ?? []
  } catch {
    return []
  }
}

export async function safeGetAllProperties(locale: string): Promise<Property[]> {
  try {
    const { getAllProperties } = await import('@/sanity/lib/queries')
    return (await getAllProperties(locale)) ?? []
  } catch {
    return []
  }
}

export async function safeGetPropertiesByType(
  type: string,
  locale: string,
): Promise<Property[]> {
  try {
    const { getPropertiesByType } = await import('@/sanity/lib/queries')
    return (await getPropertiesByType(type as Parameters<typeof getPropertiesByType>[0], locale)) ?? []
  } catch {
    return []
  }
}

export async function safeGetPropertyBySlug(
  slug: string,
  locale: string,
): Promise<Property | null> {
  try {
    const { getPropertyBySlug } = await import('@/sanity/lib/queries')
    return (await getPropertyBySlug(slug, locale)) ?? null
  } catch {
    return null
  }
}

export async function safeGetAllAgents(locale: string) {
  try {
    const { getAllAgents } = await import('@/sanity/lib/queries')
    return (await getAllAgents(locale)) ?? []
  } catch {
    return []
  }
}

export async function safeGetAgentBySlug(slug: string, locale: string) {
  try {
    const { getAgentBySlug } = await import('@/sanity/lib/queries')
    return (await getAgentBySlug(slug, locale)) ?? null
  } catch {
    return null
  }
}
