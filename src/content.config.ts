import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const aboutCollection = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/about' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
  }),
});

export const collections = {
  about: aboutCollection,
};
