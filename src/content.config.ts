import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    summary: z.string().optional(),
  }),
});

const publications = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/publications" }),
  schema: z.object({
    title: z.string(),
    authors: z.array(z.string()),
    date: z.coerce.date(),
    year: z.number(),
    abstract: z.string().optional(),
    status: z.enum(['preprint', 'working-paper', 'published', 'in-review']),
    venue: z.string().optional(),
    pdf: z.string().optional(),
    doi: z.string().optional(),
    tags: z.array(z.string()).default([]),
    selected: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().optional(),
    status: z.enum(['active', 'completed', 'archived', 'ongoing']),
    tags: z.array(z.string()).default([]),
    repository: z.string().url().optional(),
    demo: z.string().url().optional(),
    selected: z.boolean().default(false),
  }),
});

const teaching = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/teaching" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    materials: z.array(z.object({
      label: z.string(),
      url: z.string(),
    })).default([]),
    role: z.string().optional(), // e.g., "Teaching Assistant", "Lecturer"
    venue: z.string().optional(),
  }),
});

export const collections = { blog, publications, projects, teaching };
