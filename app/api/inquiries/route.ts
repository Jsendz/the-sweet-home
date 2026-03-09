import { NextRequest, NextResponse } from 'next/server'
import { createContact } from '@/lib/hubspot'
import { sendInquiryConfirmation, sendAgentNotification } from '@/lib/resend'
import { getPropertyBySlug } from '@/sanity/lib/queries'

// ─── Types ────────────────────────────────────────────────────────────────────

type InquiryBody = {
  firstName: string
  lastName: string
  email: string
  phone: string
  message: string
  /** Optional — omit for general contact enquiries not linked to a property */
  propertySlug?: string
  locale: string
}

type SuccessResponse = { success: true }
type ErrorResponse = { success: false; error: string }

// ─── Validation ───────────────────────────────────────────────────────────────

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validate(body: Partial<InquiryBody>): string | null {
  if (!body.firstName?.trim()) return 'First name is required'
  if (!body.lastName?.trim()) return 'Last name is required'
  if (!body.email?.trim() || !isValidEmail(body.email)) return 'A valid email address is required'
  if (!body.phone?.trim()) return 'Phone number is required'
  if (!body.message?.trim()) return 'Message is required'
  if (!body.locale?.trim()) return 'Locale is required'
  return null
}

// ─── POST /api/inquiries ──────────────────────────────────────────────────────

export async function POST(
  request: NextRequest,
): Promise<NextResponse<SuccessResponse | ErrorResponse>> {
  let body: Partial<InquiryBody>

  try {
    body = (await request.json()) as Partial<InquiryBody>
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const validationError = validate(body)
  if (validationError) {
    return NextResponse.json({ success: false, error: validationError }, { status: 422 })
  }

  // Cast is safe — validate() confirms all required fields are present.
  const input = body as InquiryBody

  // Fetch the property (if a slug was provided) to get localised title and agent email.
  const property = input.propertySlug
    ? await getPropertyBySlug(input.propertySlug, input.locale)
    : null

  if (input.propertySlug && !property) {
    return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })
  }

  try {
    // 1. Create / update HubSpot contact
    await createContact(input)

    // 2. Confirmation email to the lead (in their locale)
    await sendInquiryConfirmation(
      input.email,
      `${input.firstName} ${input.lastName}`,
      property?.title ?? 'General Enquiry',
      input.locale,
    )

    // 3. Notification email to the agent (only if property-linked)
    if (property) {
      await sendAgentNotification(property.agent.email, input, property.title)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred'
    console.error('[POST /api/inquiries]', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
