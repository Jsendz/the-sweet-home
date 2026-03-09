// ─── HubSpot client ───────────────────────────────────────────────────────────
// Uses the HubSpot Contacts API v3 via plain fetch so there is no Node SDK
// dependency that could break edge runtimes.

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateContactInput = {
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
  /** Optional — omit for general contact enquiries not linked to a property */
  propertySlug?: string
  locale: string
}

type HubSpotProperty = { property: string; value: string }

type HubSpotContactResponse = {
  vid?: number
  error?: string
  message?: string
}

// ─── createContact ────────────────────────────────────────────────────────────

/**
 * Creates or updates a HubSpot contact with the inquiry details.
 * Returns the HubSpot contact vid on success.
 */
export async function createContact(
  input: CreateContactInput,
): Promise<{ vid: number }> {
  const apiKey = requireEnv('HUBSPOT_API_KEY')

  const properties: HubSpotProperty[] = [
    { property: 'firstname', value: input.firstName },
    { property: 'lastname', value: input.lastName },
    { property: 'email', value: input.email },
    { property: 'phone', value: input.phone },
    { property: 'message', value: input.message },
    { property: 'hs_language', value: input.locale },
  ]

  if (input.propertySlug) {
    properties.push({ property: 'property_slug', value: input.propertySlug })
  }

  const response = await fetch(
    'https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/' +
      encodeURIComponent(input.email),
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ properties }),
    },
  )

  const data = (await response.json()) as HubSpotContactResponse

  if (!response.ok) {
    throw new Error(
      `HubSpot API error ${response.status}: ${data.message ?? data.error ?? 'Unknown error'}`,
    )
  }

  if (!data.vid) {
    throw new Error('HubSpot returned a success status but no contact vid')
  }

  return { vid: data.vid }
}
