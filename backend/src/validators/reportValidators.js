import { z } from 'zod';

const reportBody = z.object({
  patientId: z.string().min(1),
  date: z.string().min(1),
  diagnosis: z.string().trim().min(2).max(1000),
  treatmentPlan: z.string().trim().min(2).max(2000),
  sessionNotes: z.string().trim().min(2).max(3000),
  progress: z.enum(['improving', 'stable', 'worse']),
  attachments: z.array(z.string().url()).optional().default([])
});

const reportQuery = z.object({
  patientId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});

const idParams = z.object({
  id: z.string().min(1)
});

export const createReportSchema = z.object({
  body: reportBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const updateReportSchema = z.object({
  body: reportBody,
  query: z.object({}).passthrough(),
  params: idParams
});

export const getReportsSchema = z.object({
  body: z.object({}).passthrough(),
  query: reportQuery,
  params: z.object({}).passthrough()
});

export const reportIdSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: idParams
});
