import { z } from 'zod';

const patientBody = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  age: z.number().int().min(0).max(120),
  gender: z.enum(['male', 'female']),
  address: z.string().trim().max(255).optional().or(z.literal('')),
  condition: z.string().trim().min(2).max(255),
  notes: z.string().trim().max(2000).optional().or(z.literal(''))
});

const patientQuery = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['fullName', 'age', 'condition', 'createdAt', 'lastVisit']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

const idParams = z.object({
  id: z.string().min(1)
});

export const createPatientSchema = z.object({
  body: patientBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const updatePatientSchema = z.object({
  body: patientBody,
  query: z.object({}).passthrough(),
  params: idParams
});

export const getPatientsSchema = z.object({
  body: z.object({}).passthrough(),
  query: patientQuery,
  params: z.object({}).passthrough()
});

export const patientIdSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: idParams
});
