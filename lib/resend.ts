import { Resend } from 'resend'
import type { CreateContactInput } from './hubspot'

// ─── Client ───────────────────────────────────────────────────────────────────

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`Missing required environment variable: ${name}`)
  return value
}

function getResendClient(): Resend {
  return new Resend(requireEnv('RESEND_API_KEY'))
}

// ─── Localised copy ───────────────────────────────────────────────────────────

type LocaleCopy = {
  subject: string
  greeting: (name: string) => string
  body: (propertyTitle: string) => string
  closing: string
}

const copy: Record<string, LocaleCopy> = {
  en: {
    subject: 'We received your enquiry',
    greeting: (name) => `Hello ${name},`,
    body: (t) =>
      `Thank you for your interest in <strong>${t}</strong>. One of our agents will be in touch with you shortly to arrange a viewing.`,
    closing: 'The Sweet Estate Team',
  },
  fr: {
    subject: 'Nous avons bien reçu votre demande',
    greeting: (name) => `Bonjour ${name},`,
    body: (t) =>
      `Merci de votre intérêt pour <strong>${t}</strong>. L'un de nos agents vous contactera très prochainement pour organiser une visite.`,
    closing: "L'équipe Sweet Estate",
  },
  es: {
    subject: 'Hemos recibido su consulta',
    greeting: (name) => `Hola ${name},`,
    body: (t) =>
      `Gracias por su interés en <strong>${t}</strong>. Uno de nuestros agentes se pondrá en contacto con usted en breve para organizar una visita.`,
    closing: 'El equipo de Sweet Estate',
  },
  ca: {
    subject: "Hem rebut la seva consulta",
    greeting: (name) => `Hola ${name},`,
    body: (t) =>
      `Gràcies pel seu interès en <strong>${t}</strong>. Un dels nostres agents es posarà en contacte amb vostè en breu per organitzar una visita.`,
    closing: "L'equip de Sweet Estate",
  },
}

function getCopy(locale: string): LocaleCopy {
  return copy[locale] ?? copy['en']
}

// ─── Email helpers ────────────────────────────────────────────────────────────

const FROM_ADDRESS = 'Sweet Estate <hello@sweetestate.eu>'

/**
 * Sends a confirmation email to the lead in their preferred language.
 */
export async function sendInquiryConfirmation(
  to: string,
  name: string,
  propertyTitle: string,
  locale: string,
): Promise<void> {
  const resend = getResendClient()
  const lc = getCopy(locale)

  const html = `
    <p>${lc.greeting(name)}</p>
    <p>${lc.body(propertyTitle)}</p>
    <br />
    <p>${lc.closing}</p>
  `.trim()

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    subject: lc.subject,
    html,
  })

  if (error) {
    throw new Error(`Resend error (confirmation): ${error.message}`)
  }
}

/**
 * Sends an internal notification to the agent when a new lead comes in.
 */
export async function sendAgentNotification(
  agentEmail: string,
  lead: Pick<CreateContactInput, 'firstName' | 'lastName' | 'email' | 'phone' | 'message'>,
  propertyTitle: string,
): Promise<void> {
  const resend = getResendClient()

  const html = `
    <h2>New enquiry — ${propertyTitle}</h2>
    <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName}</p>
    <p><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
    <p><strong>Phone:</strong> ${lead.phone}</p>
    <hr />
    <p>${lead.message}</p>
  `.trim()

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: agentEmail,
    subject: `New enquiry: ${propertyTitle}`,
    html,
  })

  if (error) {
    throw new Error(`Resend error (agent notification): ${error.message}`)
  }
}
