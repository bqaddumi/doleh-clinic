import { z } from 'zod';

const reservationBody = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  scheduledAt: z.string().min(1),
  notes: z.string().trim().max(2000).optional().or(z.literal(''))
});

const reservationAdminBody = z.object({
  scheduledAt: z.string().min(1),
  status: z.enum(['pending', 'accepted', 'rejected']),
  adminNotes: z.string().trim().max(2000).optional().or(z.literal(''))
});

const reservationQuery = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']).optional().or(z.literal('')),
  date: z.string().optional().or(z.literal('')),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});

const availabilityQuery = z.object({
  date: z.string().min(1)
});

const dateOptionsQuery = z.object({
  days: z.coerce.number().int().min(1).max(90).default(30)
});

const idParams = z.object({
  id: z.string().min(1)
});

export const createReservationSchema = z.object({
  body: reservationBody,
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

export const updateReservationByAdminSchema = z.object({
  body: reservationAdminBody,
  query: z.object({}).passthrough(),
  params: idParams
});

export const getReservationsSchema = z.object({
  body: z.object({}).passthrough(),
  query: reservationQuery,
  params: z.object({}).passthrough()
});

export const reservationIdSchema = z.object({
  body: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
  params: idParams
});

export const reservationAvailabilitySchema = z.object({
  body: z.object({}).passthrough(),
  query: availabilityQuery,
  params: z.object({}).passthrough()
});

export const reservationDateOptionsSchema = z.object({
  body: z.object({}).passthrough(),
  query: dateOptionsQuery,
  params: z.object({}).passthrough()
});
