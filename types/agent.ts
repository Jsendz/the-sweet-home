import type { LocalizedString, AgentReference, Property } from './property'

/**
 * Full Agent type — extends the slim AgentReference (used on Property)
 * with a localised bio and the agent's full property listings.
 */
export type Agent = AgentReference & {
  bio: LocalizedString
  listings: Property[]
}

// Re-export so consumers can import everything from this file if they prefer
export type { LocalizedString, AgentReference }
