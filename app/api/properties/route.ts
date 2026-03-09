import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase'
import type { PropertyType, PropertyStatus } from '@/types'

// ─── Config ───────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20

// ─── Types ────────────────────────────────────────────────────────────────────

type PropertyRow = {
  id: string
  slug: string
  title: Record<string, string>
  description: Record<string, string>
  type: PropertyType
  status: PropertyStatus
  price: number
  price_label: string
  bedrooms: number
  bathrooms: number
  reception_rooms: number
  square_meters: number
  address: string
  city: string
  postcode: string
  country: string
  coordinates: { lat: number; lng: number }
  features: Record<string, string>[]
  images: string[]
  agent_id: string
  listed_at: string
}

type PaginatedResponse = {
  data: PropertyRow[]
  page: number
  pageSize: number
  total: number
}

type ErrorResponse = { error: string }

// ─── GET /api/properties ──────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
): Promise<NextResponse<PaginatedResponse | ErrorResponse>> {
  const { searchParams } = request.nextUrl

  const type = searchParams.get('type') as PropertyType | null
  const status = searchParams.get('status') as PropertyStatus | null
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const bedrooms = searchParams.get('bedrooms')
  const city = searchParams.get('city')
  const locale = searchParams.get('locale') ?? 'en'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))

  const validTypes: PropertyType[] = [
    'residential_sale',
    'residential_rental',
    'commercial',
    'luxury',
  ]
  const validStatuses: PropertyStatus[] = ['available', 'under_offer', 'sold', 'rented']
  const validLocales = ['en', 'fr', 'es', 'ca']

  if (type && !validTypes.includes(type)) {
    return NextResponse.json({ error: `Invalid type: ${type}` }, { status: 400 })
  }
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 })
  }
  if (!validLocales.includes(locale)) {
    return NextResponse.json({ error: `Invalid locale: ${locale}` }, { status: 400 })
  }

  try {
    const supabase = getSupabaseServerClient()

    let query = supabase
      .from('properties')
      .select('*', { count: 'exact' })
      .order('listed_at', { ascending: false })
      .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

    if (type) query = query.eq('type', type)
    if (status) query = query.eq('status', status)
    if (minPrice) query = query.gte('price', parseInt(minPrice, 10))
    if (maxPrice) query = query.lte('price', parseInt(maxPrice, 10))
    if (bedrooms) query = query.gte('bedrooms', parseInt(bedrooms, 10))
    if (city) query = query.ilike('city', `%${city}%`)

    const { data, error, count } = await query

    if (error) {
      console.error('[GET /api/properties] Supabase error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: (data ?? []) as PropertyRow[],
      page,
      pageSize: PAGE_SIZE,
      total: count ?? 0,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[GET /api/properties]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
