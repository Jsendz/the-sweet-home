import { defineField, defineType } from 'sanity'

/**
 * Reusable helper — builds a set of en/fr/es/ca sub-fields
 * for any localised text field shown in the Studio.
 */
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
      rows: 4,
      description,
      validation: (Rule) => Rule.required().error('English version is required'),
    }),
    defineField({
      name: 'fr',
      title: 'French (Français)',
      type: 'text',
      rows: 4,
      description,
    }),
    defineField({
      name: 'es',
      title: 'Spanish (Español)',
      type: 'text',
      rows: 4,
      description,
    }),
    defineField({
      name: 'ca',
      title: 'Catalan (Català)',
      type: 'text',
      rows: 4,
      description,
    }),
  ]
}

export const propertySchema = defineType({
  name: 'property',
  title: 'Property',
  type: 'document',

  preview: {
    select: {
      titleEn: 'title.en',
      price: 'priceLabel',
      media: 'images.0',
    },
    prepare({ titleEn, price, media }: { titleEn: string; price: string; media: string }) {
      return {
        title: titleEn ?? 'Untitled property',
        subtitle: price ?? '',
        media: media ? undefined : undefined, // image URLs handled separately
      }
    },
  },

  fields: [
    // ── Identity ──────────────────────────────────────────────
    defineField({
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      description:
        'The unique web address for this property (e.g. "villa-belle-vue-antibes"). ' +
        'Use the Generate button — do not change it after publishing.',
      options: {
        source: 'title.en',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required().error('A slug is required'),
    }),

    // ── Localised Title ───────────────────────────────────────
    defineField({
      name: 'title',
      title: 'Property Title',
      type: 'object',
      description: 'The headline name of the property in each language.',
      fields: localeStringFields('Short, punchy title shown on listing cards and at the top of the property page.'),
      validation: (Rule) => Rule.required(),
    }),

    // ── Localised Description ─────────────────────────────────
    defineField({
      name: 'description',
      title: 'Description',
      type: 'object',
      description: 'Full marketing description of the property in each language.',
      fields: localeTextFields('Write a compelling description. Minimum 80 characters recommended.'),
      validation: (Rule) => Rule.required(),
    }),

    // ── Classification ────────────────────────────────────────
    defineField({
      name: 'type',
      title: 'Property Type',
      type: 'string',
      description: 'Choose the category that best describes this listing.',
      options: {
        list: [
          { title: 'Residential — For Sale', value: 'residential_sale' },
          { title: 'Residential — For Rent', value: 'residential_rental' },
          { title: 'Commercial', value: 'commercial' },
          { title: 'Luxury', value: 'luxury' },
        ],
        layout: 'radio',
      },
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'status',
      title: 'Listing Status',
      type: 'string',
      description: 'Keep this up to date — it controls the badge shown on the listing.',
      options: {
        list: [
          { title: 'Available', value: 'available' },
          { title: 'Under Offer', value: 'under_offer' },
          { title: 'Sold', value: 'sold' },
          { title: 'Rented', value: 'rented' },
        ],
        layout: 'radio',
      },
      initialValue: 'available',
      validation: (Rule) => Rule.required(),
    }),

    // ── Pricing ───────────────────────────────────────────────
    defineField({
      name: 'price',
      title: 'Price (numeric)',
      type: 'number',
      description: 'Enter the price in euros as a plain number, e.g. 450000. Used for sorting and filtering.',
      validation: (Rule) => Rule.required().min(0),
    }),

    defineField({
      name: 'priceLabel',
      title: 'Price Label',
      type: 'string',
      description: 'The formatted price shown to visitors, e.g. "€450,000" or "€2,500 / month".',
      validation: (Rule) => Rule.required(),
    }),

    // ── Property Details ──────────────────────────────────────
    defineField({
      name: 'bedrooms',
      title: 'Bedrooms',
      type: 'number',
      description: 'Total number of bedrooms.',
      validation: (Rule) => Rule.required().min(0).integer(),
    }),

    defineField({
      name: 'bathrooms',
      title: 'Bathrooms',
      type: 'number',
      description: 'Total number of bathrooms.',
      validation: (Rule) => Rule.required().min(0).integer(),
    }),

    defineField({
      name: 'receptionRooms',
      title: 'Reception Rooms',
      type: 'number',
      description: 'Number of reception rooms (living room, dining room, etc.).',
      validation: (Rule) => Rule.required().min(0).integer(),
    }),

    defineField({
      name: 'squareMeters',
      title: 'Size (m²)',
      type: 'number',
      description: 'Total floor area in square metres.',
      validation: (Rule) => Rule.required().min(0),
    }),

    // ── Location ──────────────────────────────────────────────
    defineField({
      name: 'address',
      title: 'Street Address',
      type: 'string',
      description: 'Street address line, e.g. "12 Rue des Mimosas".',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'city',
      title: 'City / Town',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'postcode',
      title: 'Postcode / ZIP',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'country',
      title: 'Country',
      type: 'string',
      initialValue: 'France',
      validation: (Rule) => Rule.required(),
    }),

    defineField({
      name: 'coordinates',
      title: 'Map Coordinates',
      type: 'object',
      description: 'Latitude and longitude for the map pin. Find these on Google Maps.',
      fields: [
        defineField({
          name: 'lat',
          title: 'Latitude',
          type: 'number',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'lng',
          title: 'Longitude',
          type: 'number',
          validation: (Rule) => Rule.required(),
        }),
      ],
    }),

    // ── Features ──────────────────────────────────────────────
    defineField({
      name: 'features',
      title: 'Key Features',
      type: 'array',
      description:
        'Bullet-point features shown on the listing page (e.g. "South-facing garden", "Underfloor heating"). ' +
        'Add one feature per item and translate into each language.',
      of: [
        {
          type: 'object',
          name: 'localizedFeature',
          title: 'Feature',
          fields: localeStringFields('Short feature label, e.g. "Heated swimming pool".'),
          preview: {
            select: { title: 'en' },
          },
        },
      ],
    }),

    // ── Images ────────────────────────────────────────────────
    defineField({
      name: 'images',
      title: 'Photos',
      type: 'array',
      description:
        'Paste Cloudinary image URLs here. The first image is used as the cover photo on listing cards.',
      of: [
        {
          type: 'object',
          name: 'imageUrl',
          title: 'Image URL',
          fields: [
            defineField({
              name: 'url',
              title: 'Cloudinary URL',
              type: 'url',
              validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
            }),
            defineField({
              name: 'alt',
              title: 'Alt Text (for accessibility)',
              type: 'string',
              description: 'Briefly describe what is in the photo, e.g. "Front elevation at dusk".',
            }),
          ],
          preview: {
            select: { title: 'alt', subtitle: 'url' },
          },
        },
      ],
      validation: (Rule) => Rule.min(1).error('At least one photo is required'),
    }),

    // ── Agent ─────────────────────────────────────────────────
    defineField({
      name: 'agent',
      title: 'Listing Agent',
      type: 'reference',
      to: [{ type: 'agent' }],
      description: 'The agent responsible for this property.',
      validation: (Rule) => Rule.required(),
    }),

    // ── Dates ─────────────────────────────────────────────────
    defineField({
      name: 'listedAt',
      title: 'Date Listed',
      type: 'date',
      description: 'The date this property was first listed.',
      options: { dateFormat: 'YYYY-MM-DD' },
      validation: (Rule) => Rule.required(),
    }),
  ],
})
