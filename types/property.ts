export type LocalizedString = {
  en: string
  fr: string
  es: string
  ca: string
}

export type PropertyType =
  | 'residential_sale'
  | 'residential_rental'
  | 'commercial'
  | 'luxury'

export type PropertyStatus = 'available' | 'under_offer' | 'sold' | 'rented'

/**
 * Slim agent reference attached to each property.
 * The full Agent type (with listings) lives in types/agent.ts.
 * This avoids a circular dependency between the two modules.
 */
export type AgentReference = {
  id: string
  name: string
  slug: string
  photo: string
  title: LocalizedString
  phone: string
  email: string
}

export type Property = {
  id: string
  /** URL slug — identical across all languages */
  slug: string
  title: LocalizedString
  description: LocalizedString
  type: PropertyType
  status: PropertyStatus
  /** Raw numeric price in euros */
  price: number
  /** Formatted price label e.g. "€450,000" */
  priceLabel: string
  bedrooms: number
  bathrooms: number
  receptionRooms: number
  squareMeters: number
  /** Not translated — physical address components */
  address: string
  city: string
  postcode: string
  country: string
  coordinates: {
    lat: number
    lng: number
  }
  /** Array of localised feature strings e.g. "South-facing garden" */
  features: LocalizedString[]
  /** Cloudinary image URLs */
  images: string[]
  agent: AgentReference
  /** ISO 8601 date string e.g. "2025-06-01" */
  listedAt: string
}
