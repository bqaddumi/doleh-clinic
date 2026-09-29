import { z } from 'zod';

const bannerBody = z.object({
  messageEn: z.string().trim().min(1).max(300),
  messageAr: z.string().trim().min(1).max(300),
  isActive: z.boolean().default(true),
  order: z.coerce.number().int().min(0).default(0)
});

const idParams = z.object({
  id: z.string().min(1)
});

export const createBannerSchema = z.object({
  body: bannerBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const updateBannerSchema = z.object({
  body: bannerBody,
  query: z.object({}).passthrough(),
  params: idParams
});

export const bannerIdSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: idParams
});
