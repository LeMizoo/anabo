import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './schemas/schema'

export default defineConfig({
  name: 'anabo-cms',
  title: process.env.SANITY_STUDIO_TITLE || 'ANABO ROADTRIP — CMS',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID!,
  dataset: process.env.SANITY_STUDIO_DATASET!,
  plugins: [
    structureTool(),
    visionTool({ defaultApiVersion: '2024-10-06' }),
  ],
  schema: {
    types: schemaTypes,
  },
})
