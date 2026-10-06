import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles=defineCollection({
  loader:glob({pattern:'**/*.{md,mdx}',base:'./src/content/articles'}),
  schema:z.object({
    title:z.string(),
    description:z.string(),
    date:z.coerce.date(),
    section:z.enum(['analysis','scouting','culture','method']),
    evidenceClass:z.enum(['DIRECT','DERIVED','PROXY','EDITORIAL']),
    claimCeiling:z.string(),
    featured:z.boolean().default(false),
    draft:z.boolean().default(false)
  })
});

const research=defineCollection({
  loader:glob({pattern:'**/*.{md,mdx}',base:'./src/content/research'}),
  schema:z.object({
    title:z.string(),
    description:z.string(),
    date:z.coerce.date(),
    claimCeiling:z.string(),
    featured:z.boolean().default(false),
    draft:z.boolean().default(false)
  })
});

const visuals=defineCollection({
  loader:glob({pattern:'**/*.{md,mdx}',base:'./src/content/visuals'}),
  schema:z.object({
    title:z.string(),
    description:z.string(),
    date:z.coerce.date(),
    visualClass:z.enum(['EVIDENCE_VISUAL','DATA_VISUAL','ANALYTICAL_DIAGRAM','HYPOTHESIS_VISUAL','DOCUMENTARY_PHOTO','EDITORIAL_ILLUSTRATION','TABLE','INFOGRAPHIC']),
    claimCeiling:z.string(),
    featured:z.boolean().default(false),
    draft:z.boolean().default(false)
  })
});

export const collections={articles,research,visuals};
