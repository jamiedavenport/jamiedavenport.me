import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const blog = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.mdx",
    generateId: ({ entry }) => entry.replace(/\.mdx$/, "").replace(/\/index$/, ""),
  }),
  schema: z
    .object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      draft: z.boolean().default(false),
    })
    .refine((post) => !post.updatedAt || post.updatedAt >= post.publishedAt, {
      message: "updatedAt must not be earlier than publishedAt",
      path: ["updatedAt"],
    }),
});

export const collections = { blog };
