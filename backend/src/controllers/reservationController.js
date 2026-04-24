import {
  createReservation as createReservationRecord,
  getReservationAvailability as getReservationAvailabilityData,
  getReservationDateOptions as getReservationDateOptionsData,
  getReservationById as getReservationRecord,
  getTodayReservationsOverview as getTodayReservationsOverviewData,
  listReservations,
  updateReservationByAdmin as updateReservationByAdminRecord
} from '../services/dataService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const normalizePatientPayload = (body) => ({
  fullName: body.fullName,
  phone: body.phone,
  scheduledAt: body.scheduledAt,
  notes: body.notes || ''
});

const normalizeAdminPayload = (body) => ({
  scheduledAt: body.scheduledAt,
  status: body.status,
  adminNotes: body.adminNotes || ''
});

const canAccessReservation = (user, reservation) =>
  user.role === 'admin' || String(reservation.userId?._id || reservation.userId) === user._id;

export const getReservations = asyncHandler(async (req, res) => {
  const result = await listReservations({
    ...req.validated.query,
    user: req.user
  });

  res.json(result);
});

export const createReservation = asyncHandler(async (req, res) => {
  const reservation = await createReservationRecord({
    userId: req.user.role === 'patient' ? req.user._id : null,
    ...normalizePatientPayload(req.validated.body)
  });

  res.status(201).json(reservation);
});

export const createPublicReservation = asyncHandler(async (req, res) => {
  const reservation = await createReservationRecord({
    userId: req.user?.role === 'patient' ? req.user._id : null,
    ...normalizePatientPayload(req.validated.body)
  });

  res.status(201).json(reservation);
});

export const getReservationById = asyncHandler(async (req, res) => {
  const reservation = await getReservationRecord(req.validated.params.id);

  if (!reservation) {
    throw new ApiError(404, 'Reservation not found');
  }

  if (!canAccessReservation(req.user, reservation)) {
    throw new ApiError(403, 'Not authorized to view this reservation');
  }

  res.json(reservation);
});

export const updateReservationByAdmin = asyncHandler(async (req, res) => {
  const reservation = await getReservationRecord(req.validated.params.id);

  if (!reservation) {
    throw new ApiError(404, 'Reservation not found');
  }

  const updated = await updateReservationByAdminRecord(req.validated.params.id, normalizeAdminPayload(req.validated.body));
  res.json(updated);
});

export const getTodayReservationsOverview = asyncHandler(async (req, res) => {
  const result = await getTodayReservationsOverviewData();
  res.json(result);
});

export const getReservationAvailability = asyncHandler(async (req, res) => {
  const result = await getReservationAvailabilityData(req.validated.query.date);
  res.json(result);
});

export const getReservationDateOptions = asyncHandler(async (req, res) => {
  const result = await getReservationDateOptionsData(req.validated.query.days);
  res.json(result);
});
