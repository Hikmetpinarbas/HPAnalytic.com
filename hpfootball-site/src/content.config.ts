import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const articles=defineCollection({
  loader:glob({pattern:'**/*.{md,mdx}',base:'./src/content/articles'}),
  schema:z.object({
    title:z.string(),description:z.string(),date:z.coerce.date(),section:z.enum(['analysis','scouting','culture','method']),
    evidenceClass:z.enum(['DIRECT','DERIVED','PROXY','EDITORIAL']),claimCeiling:z.string(),featured:z.boolean().default(false)
  })
});
export const collections={articles};