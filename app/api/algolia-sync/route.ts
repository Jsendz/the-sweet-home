/**
 * POST /api/algolia-sync
 *
 * Sanity webhook handler — triggered when a property document is published,
 * updated, or deleted in Sanity Studio.
 *
 * Configure in Sanity (manage.sanity.io → API → Webhooks):
 *   URL:    https://your-domain.com/api/algolia-sync
 *   Filter: _type == "property"
 *   Trigger on: create, update, delete
 *   Secret: set SANITY_WEBHOOK_SECRET in .env.local
 *   HTTP method: POST
 *   Include document in payload: ✓ (for create/update)
 */

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { indexProperty, deletePropertyFromIndex } from '@/lib/algolia'
import type { Property } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Sanity sends the full document on create/update.
 * On delete it sends the document with _deletedAt populated.
 */
type SanityWebhookPayload = Partial<Property> & {
  _id: string
  _type: string
  _rev?: string
  _deletedAt?: string
}

type SuccessResponse = { ok: true; indexed?: number; deleted?: boolean }
type ErrorResponse = { ok: false; error: string }

// ─── Signature verification ───────────────────────────────────────────────────

function verifySignature(
  body: string,
  signature: string | null,
  secret: string,
): boolean {
  if (!signature) return false
  const expected = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex')
  // Use timingSafeEqual to prevent timing attacks
  const expectedBuf = Buffer.from(expected, 'hex')
  const signatureBuf = Buffer.from(signature.replace(/^sha256=/, ''), 'hex')
  if (expectedBuf.length !== signatureBuf.length) return false
  return crypto.timingSafeEqual(expectedBuf, signatureBuf)
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  // 1. Read raw body (needed for signature verification)
  const rawBody = await request.text()

  // 2. Verify webhook signature
  const secret = process.env.SANITY_WEBHOOK_SECRET
  if (secret) {
    const signature =
      request.headers.get('x-sanity-signature') ??
      request.headers.get('sanity-webhook-signature')

    if (!verifySignature(rawBody, signature, secret)) {
      console.warn('[algolia-sync] Invalid webhook signature')
      return NextResponse.json(
        { ok: false, error: 'Invalid signature' },
        { status: 401 },
      )
    }
  } else {
    console.warn('[algolia-sync] SANITY_WEBHOOK_SECRET not set — skipping verification')
  }

  // 3. Parse payload
  let payload: SanityWebhookPayload
  try {
    payload = JSON.parse(rawBody) as SanityWebhookPayload
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Invalid JSON body' },
      { status: 400 },
    )
  }

  // 4. Only handle property documents
  if (payload._type !== 'property') {
    return NextResponse.json({ ok: true, indexed: 0 })
  }

  // 5. Deletion — Sanity sets _deletedAt on the payload
  const isDeleted = Boolean(payload._deletedAt)

  if (isDeleted) {
    try {
      await deletePropertyFromIndex(payload._id)
      console.log(`[algolia-sync] Deleted property ${payload._id} from all locale indexes`)
      return NextResponse.json({ ok: true, deleted: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      console.error('[algolia-sync] Delete failed:', message)
      return NextResponse.json({ ok: false, error: message }, { status: 500 })
    }
  }

  // 6. Create / update — validate required fields are present
  const property = payload as unknown as Property

  if (!property.id && !payload._id) {
    return NextResponse.json(
      { ok: false, error: 'Payload missing property id' },
      { status: 422 },
    )
  }

  // Map Sanity _id → property.id if the SDK hasn't renamed it yet
  if (!property.id) {
    property.id = payload._id
  }

  if (!property.slug || !property.title || !property.price) {
    return NextResponse.json(
      { ok: false, error: 'Payload missing required property fields' },
      { status: 422 },
    )
  }

  try {
    await indexProperty(property)
    console.log(`[algolia-sync] Indexed property ${property.id} (${property.slug}) in all locale indexes`)
    return NextResponse.json({ ok: true, indexed: 4 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[algolia-sync] Indexing failed:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
