import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { schemaTypes } from './schemas'

/**
 * Sanity Studio configuration.
 *
 * To run the embedded Studio (requires `next-sanity` or `sanity` package):
 *   npx sanity dev --dir sanity
 *
 * Or mount it inside Next.js at /studio by adding an App Router route:
 *   app/studio/[[...tool]]/page.tsx  →  <NextStudio config={config} />
 */
export default defineConfig({
  name: 'sweet-estate',
  title: 'Real Estate CMS',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? '',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            S.listItem()
              .title('Properties')
              .icon(() => '🏠')
              .child(S.documentTypeList('property').title('All Properties')),
            S.divider(),
            S.listItem()
              .title('Agents')
              .icon(() => '👤')
              .child(S.documentTypeList('agent').title('All Agents')),
          ]),
    }),
  ],

  schema: {
    types: schemaTypes,
  },
})
