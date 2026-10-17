import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const editorialFields={
  target:z.string().optional(), content_type:z.string().optional(), source_system:z.string().optional(),
  claim_status:z.string().optional(), evidence_role:z.string().optional(), rights_status:z.string().optional(),
  canonical_content_id:z.string().optional(), visual_refs:z.array(z.string()).optional(),
  summary:z.string().optional(), body:z.string().optional(), provenance:z.string().optional(),
  editorial_status:z.enum(['PUBLISHED','WITHDRAWN','SUPERSEDED']).optional(),
};

const articles=defineCollection({
  loader:glob({pattern:'**/*.{md,mdx}',base:'./src/content/articles'}),
  schema:z.object({
    title:z.string(), description:z.string(), date:z.coerce.date(),
    section:z.enum(['analysis','scouting','culture','method']),
    evidenceClass:z.enum(['DIRECT','DERIVED','PROXY','EDITORIAL']), claimCeiling:z.string(),
    nextQuestion:z.object({question:z.string(),href:z.string().startsWith('/')}).optional(),
    relations:z.object({mechanisms:z.array(z.string()).default([]),teams:z.array(z.string()).default([]),roles:z.array(z.string()).default([]),researchLines:z.array(z.string()).default([])}).optional(),
    featured:z.boolean().default(false), draft:z.boolean().default(false),
    articleKind:z.enum(['DEEP_ANALYSIS','EXPLAINER','EVIDENCE_REVIEW','FOOTBALL_SCIENCE','MYTH_REALITY','DATA_STORY','VIDEO_INTELLIGENCE','HISTORICAL_RECONSTRUCTION','CROSS_DOMAIN_ESSAY']).optional(),
    series:z.enum(['MATCH_ANALYSIS','MECHANISM_EXPLAINER','METRIC_EXPLAINER','EVIDENCE_REVIEW','WHAT_TO_WATCH']).optional(),
    visualAssets:z.array(z.object({
      visual_id:z.string(),src:z.string(),caption:z.string(),claim_supported:z.string(),
      rights_status:z.string(),truth_role:z.string(),visual_role:z.string(),
    })).optional(),
    dataInsights:z.array(z.object({
      question:z.string(),metric:z.string(),interpretation:z.string(),limit:z.string(),source_label:z.string().optional(),
    })).optional(),
    mechanismCard:z.object({
      mechanism:z.string(), evidence:z.array(z.string()).min(1), counterevidence:z.array(z.string()).optional(),
      context:z.string().optional(), confidence_level:z.string().optional(), claim_ceiling:z.string(),
      alternative_explanations:z.array(z.string()).optional(), visual_explanation:z.string().optional(), provenance:z.string(),
    }).optional(),
    author:z.string().optional(), language:z.enum(['tr','en']).optional(), topics:z.array(z.string()).optional(),
    sourceRefs:z.array(z.object({
      source_id:z.string(),title:z.string(),locator:z.string(),rights:z.string(),claim_ceiling:z.string(),
    })).optional(),
    sourceRights:z.array(z.string()).optional(), claimIds:z.array(z.string()).optional(),
    counterevidence:z.array(z.string()).optional(), readingMinutes:z.number().int().positive().optional(),
    truthAuthority:z.boolean().optional(), sourceClaimsValidated:z.boolean().optional(), qualityStatus:z.string().optional(),
    ...editorialFields,
  })
});

const research=defineCollection({
  loader:glob({pattern:'**/*.{md,mdx}',base:'./src/content/research'}),
  schema:z.object({
    title:z.string(),description:z.string(),date:z.coerce.date(),claimCeiling:z.string(),
    featured:z.boolean().default(false),draft:z.boolean().default(false),...editorialFields,
  })
});

const visuals=defineCollection({
  loader:glob({pattern:'**/*.{md,mdx}',base:'./src/content/visuals'}),
  schema:z.object({
    title:z.string(),description:z.string(),date:z.coerce.date(),
    visualClass:z.enum(['EVIDENCE_VISUAL','DATA_VISUAL','ANALYTICAL_DIAGRAM','HYPOTHESIS_VISUAL','DOCUMENTARY_PHOTO','EDITORIAL_ILLUSTRATION','TABLE','INFOGRAPHIC']),
    claimCeiling:z.string(),featured:z.boolean().default(false),draft:z.boolean().default(false),...editorialFields,
  })
});
export const collections={articles,research,visuals};
