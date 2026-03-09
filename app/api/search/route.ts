import { NextRequest, NextResponse } from 'next/server'
import { getAlgoliaSearchClient, propertiesIndexName } from '@/lib/algolia'
import type { AlgoliaPropertyRecord } from '@/lib/algolia'

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchHit = {
  title: string
  slug: string
  price: number
  priceLabel: string
  city: string
  image: string
}

type SearchResponse = { hits: SearchHit[] }
type ErrorResponse = { error: string }

// ─── GET /api/search?query=…&locale=… ────────────────────────────────────────

export async function GET(
  request: NextRequest,
): Promise<NextResponse<SearchResponse | ErrorResponse>> {
  const { searchParams } = request.nextUrl

  const query = searchParams.get('query')?.trim()
  const locale = searchParams.get('locale') ?? 'en'

  if (!query) {
    return NextResponse.json({ error: 'query parameter is required' }, { status: 400 })
  }

  const validLocales = ['en', 'fr', 'es', 'ca']
  if (!validLocales.includes(locale)) {
    return NextResponse.json({ error: `Invalid locale: ${locale}` }, { status: 400 })
  }

  try {
    const client = getAlgoliaSearchClient()
    const index = client.initIndex(propertiesIndexName(locale))

    const result = await index.search<AlgoliaPropertyRecord>(query, {
      attributesToRetrieve: ['slug', 'title', 'price', 'priceLabel', 'city', 'images'],
      hitsPerPage: 10,
    })

    const hits: SearchHit[] = result.hits.map((hit) => ({
      title: hit.title,
      slug: hit.slug,
      price: hit.price,
      priceLabel: hit.priceLabel,
      city: hit.city,
      image: hit.images?.[0] ?? '',
    }))

    return NextResponse.json({ hits })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[GET /api/search]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
