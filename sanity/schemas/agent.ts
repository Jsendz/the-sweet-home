import { defineField, defineType } from 'sanity'

function localeStringFields(description: string) {
  return [
    defineField({
      name: 'en',
      title: 'English',
      type: 'string',
      description,
      validation: (Rule) => Rule.required().error('English version is required'),
    }),
    defineField({
      name: 'fr',
      title: 'French (Français)',
      type: 'string',
      description,
    }),
    defineField({
      name: 'es',
      title: 'Spanish (Español)',
      type: 'string',
      description,
    }),
    defineField({
      name: 'ca',
      title: 'Catalan (Català)',
      type: 'string',
      description,
    }),
  ]
}

function localeTextFields(description: string) {
  return [
    defineField({
      name: 'en',
      title: 'English',
      type: 'text',
      rows: 5,
      description,
      validation: (Rule) => Rule.required().error('English version is required'),
    }),
    defineField({
      name: 'fr',
      title: 'French (Français)',
      type: 'text',
      rows: 5,
      description,
    }),
    defineField({
      name: 'es',
      title: 'Spanish (Español)',
      type: 'text',
      rows: 5,
      description,
    }),
    defineField({
      name: 'ca',
      title: 'Catalan (Català)',
      type: 'text',
      rows: 5,
      description,
    }),
  ]
}

export const agentSchema = defineType({
  name: 'agent',
  title: 'Agent',
  type: 'document',

  preview: {
    select: {
      title: 'name',
      subtitle: 'email',
      media: 'photo',
    },
    prepare({ title, subtitle }: { title: string; subtitle: string }) {
      return {
        title: title ?? 'Unnamed agent',
        subtitle: subtitle ?? '',
      }
    },
  },

  fields: [
    // ── Identity ──────────────────────────────────────────────
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      description: "Agent's full name as it will appear on the website.",
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      description:
        'The unique web address for this agent\'s profile page. ' +
        'Use the Generate button — do not change it after publishing.',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),

    // ── Photo ─────────────────────────────────────────────────
    defineField({
      name: 'photo',
      title: 'Profile Photo URL',
      type: 'url',
      description:
        'Paste the Cloudinary URL for the agent\'s profile photo. ' +
        'Recommended: square crop, minimum 400×400 px.',
      validation: (Rule) =>
        Rule.required().uri({ scheme: ['http', 'https'] }),
    }),

    // ── Localised Title ───────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Job Title',
      type: 'object',
      description: 'The agent\'s role or title in each language.',
      fields: localeStringFields(
        'e.g. "Senior Sales Consultant" / "Consultant Senior en Ventes"',
      ),
      validation: (Rule) => Rule.required(),
    }),

    // ── Localised Bio ─────────────────────────────────────────
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'object',
      description: 'A short biography of the agent shown on their profile page.',
      fields: localeTextFields(
        'Write 2–4 sentences covering the agent\'s experience, specialisms, and personality.',
      ),
      validation: (Rule) => Rule.required(),
    }),

    // ── Contact Details ───────────────────────────────────────
    defineField({
      name: 'phone',
      title: 'Phone Number',
      type: 'string',
      description: 'Include the international dialling code, e.g. "+33 6 12 34 56 78".',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'email',
      title: 'Email Address',
      type: 'string',
      description: "Agent's direct email address for enquiries.",
      validation: (Rule) =>
        Rule.required().email().error('Please enter a valid email address'),
    }),
  ],
})
