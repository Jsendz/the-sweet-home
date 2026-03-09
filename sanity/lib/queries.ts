import { sanityFetch } from './client'
import type { Property, Agent, PropertyType } from '@/types'

// ─────────────────────────────────────────────────────────────────────────────
// Shared GROQ fragments
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Projects a localised object { en, fr, es, ca } into a single string
 * for the requested locale, falling back to English.
 *
 * Usage in GROQ: place inside a projection as a named field.
 */

/** Full property projection — uses $locale parameter */
const PROPERTY_FIELDS = /* groq */ `
  "id": _id,
  "slug": slug.current,
  "title": coalesce(title[$locale], title.en),
  "description": coalesce(description[$locale], description.en),
  type,
  status,
  price,
  priceLabel,
  bedrooms,
  bathrooms,
  receptionRooms,
  squareMeters,
  address,
  city,
  postcode,
  country,
  coordinates,
  "features": features[] {
    "v": coalesce(@[$locale], @.en)
  }.v,
  "images": images[].url,
  "agent": agent-> {
    "id": _id,
    name,
    "slug": slug.current,
    photo,
    "title": coalesce(title[$locale], title.en),
    phone,
    email
  },
  listedAt
`

/** Full agent projection — uses $locale parameter */
const AGENT_FIELDS = /* groq */ `
  "id": _id,
  name,
  "slug": slug.current,
  photo,
  "title": coalesce(title[$locale], title.en),
  "bio": coalesce(bio[$locale], bio.en),
  phone,
  email
`

// ─────────────────────────────────────────────────────────────────────────────
// Property queries
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch every property, newest first */
export const getAllPropertiesQuery = /* groq */ `
  *[_type == "property"] | order(listedAt desc) {
    ${PROPERTY_FIELDS}
  }
`

export async function getAllProperties(locale: string): Promise<Property[]> {
  return sanityFetch<Property[]>(getAllPropertiesQuery, { locale })
}

// ─────────────────────────────────────────────────────────────────────────────

/** Fetch a single property by its URL slug */
export const getPropertyBySlugQuery = /* groq */ `
  *[_type == "property" && slug.current == $slug][0] {
    ${PROPERTY_FIELDS}
  }
`

export async function getPropertyBySlug(
  slug: string,
  locale: string,
): Promise<Property | null> {
  return sanityFetch<Property | null>(getPropertyBySlugQuery, { slug, locale })
}

// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all properties of a given type */
export const getPropertiesByTypeQuery = /* groq */ `
  *[_type == "property" && type == $type] | order(listedAt desc) {
    ${PROPERTY_FIELDS}
  }
`

export async function getPropertiesByType(
  type: PropertyType,
  locale: string,
): Promise<Property[]> {
  return sanityFetch<Property[]>(getPropertiesByTypeQuery, { type, locale })
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Featured properties — "available" listings only, most recently listed first.
 * Returns a maximum of 6 for use on the homepage.
 */
export const getFeaturedPropertiesQuery = /* groq */ `
  *[_type == "property" && status == "available"] | order(listedAt desc) [0...6] {
    ${PROPERTY_FIELDS}
  }
`

export async function getFeaturedProperties(locale: string): Promise<Property[]> {
  return sanityFetch<Property[]>(getFeaturedPropertiesQuery, { locale })
}

// ─────────────────────────────────────────────────────────────────────────────
// Agent queries
// ─────────────────────────────────────────────────────────────────────────────

/** Fetch all agents with their current listings */
export const getAllAgentsQuery = /* groq */ `
  *[_type == "agent"] | order(name asc) {
    ${AGENT_FIELDS},
    "listings": *[_type == "property" && references(^._id)] | order(listedAt desc) {
      ${PROPERTY_FIELDS}
    }
  }
`

export async function getAllAgents(locale: string): Promise<Agent[]> {
  return sanityFetch<Agent[]>(getAllAgentsQuery, { locale })
}

// ─────────────────────────────────────────────────────────────────────────────

/** Fetch a single agent by slug, including all their listings */
export const getAgentBySlugQuery = /* groq */ `
  *[_type == "agent" && slug.current == $slug][0] {
    ${AGENT_FIELDS},
    "listings": *[_type == "property" && references(^._id)] | order(listedAt desc) {
      ${PROPERTY_FIELDS}
    }
  }
`

export async function getAgentBySlug(
  slug: string,
  locale: string,
): Promise<Agent | null> {
  return sanityFetch<Agent | null>(getAgentBySlugQuery, { slug, locale })
}
