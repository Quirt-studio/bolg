// ============================================
// VALIDATIONS - Zod schemas
// ============================================

import { z } from "zod";

export const localizedStringSchema = z.object({
  en: z.string(),
  zh: z.string(),
});

export type LocalizedString = z.infer<typeof localizedStringSchema>;

export type TagCategory = string;

export interface WorkFormData {
  title: LocalizedString;
  tag?: LocalizedString;
  tagCategory?: TagCategory;
  date?: string;
  excerpt?: LocalizedString;
  content?: LocalizedString;
  coverImageUrl?: string;
  gradient?: string;
  iconName?: string;
  featured?: boolean;
  order?: number;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;
  videoUrl?: string;
  link?: string;
}

export const workSchema = z.object({
  title: localizedStringSchema,
  tag: localizedStringSchema.optional(),
  tagCategory: z.string().optional(),
  date: z.string().optional(),
  excerpt: localizedStringSchema.optional(),
  content: z.object({ en: z.string(), zh: z.string() }).optional(),
  coverImageUrl: z.string().optional(),
  gradient: z.string().optional(),
  iconName: z.string().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  seoKeywords: z.string().optional(),
  ogImage: z.string().optional(),
  videoUrl: z.string().optional(),
  link: z.string().optional(),
});

export const categorySchema = z.object({
  title: localizedStringSchema,
  description: localizedStringSchema,
  tags: z.array(localizedStringSchema).min(1, "At least one tag required"),
  icon: z.string().min(1, "Icon is required"),
  colorScheme: z.string().min(1, "Color scheme is required"),
});

export const timelineMilestoneSchema = z.object({
  year: z.string().min(1, "Year is required"),
  isPresent: z.boolean(),
  title: localizedStringSchema,
  description: localizedStringSchema,
  tags: z.array(localizedStringSchema).min(1, "At least one tag required"),
  order: z.number().int().min(0),
});

export const aboutValueSchema = z.object({
  title: localizedStringSchema,
  description: localizedStringSchema,
  iconName: z.string().min(1, "Icon is required"),
});

export const aboutSchema = z.object({
  subtitle: localizedStringSchema,
  paragraphs: z.array(localizedStringSchema).min(1),
  values: z.array(aboutValueSchema).min(1),
  quote: localizedStringSchema,
  quoteAuthor: z.string().min(1, "Author is required"),
  techStack: z.array(z.string()).min(1, "At least one tech item required"),
});

export const heroSchema = z.object({
  eyebrow: localizedStringSchema,
  title: localizedStringSchema,
  subtitle: localizedStringSchema,
  cta1: localizedStringSchema,
  cta2: localizedStringSchema,
  cta1Link: z.string().min(1, "Link is required"),
  cta2Link: z.string().min(1, "Link is required"),
  stats: z.object({
    articles: z.string().min(1),
    projects: z.string().min(1),
  }),
  statsLabels: z.object({
    articles: localizedStringSchema,
    projects: localizedStringSchema,
  }),
});

export const navLinkSchema = z.object({
  label: localizedStringSchema,
  href: z.string().min(1, "Href is required"),
  order: z.number().int().min(0),
});

export const footerLinkSchema = z.object({
  label: z.string().min(1, "Label is required"),
  url: z.string().min(1, "URL is required"),
});

export type LocalizedStringInput = z.infer<typeof localizedStringSchema>;
export type WorkInput = z.infer<typeof workSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type TimelineMilestoneInput = z.infer<typeof timelineMilestoneSchema>;
export type AboutInput = z.infer<typeof aboutSchema>;
export type HeroInput = z.infer<typeof heroSchema>;
export type NavLinkInput = z.infer<typeof navLinkSchema>;
export type FooterLinkInput = z.infer<typeof footerLinkSchema>;
