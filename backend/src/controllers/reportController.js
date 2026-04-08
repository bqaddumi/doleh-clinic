import {
  createReport as createReportRecord,
  deleteReport as deleteReportRecord,
  getReportById as getReportRecord,
  listReports,
  readDb,
  updateReport as updateReportRecord
} from '../services/fileDatabase.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const normalizeReportPayload = (body) => ({
  ...body,
  attachments: body.attachments || [],
  date: body.date
});

export const getReports = asyncHandler(async (req, res) => {
  const result = await listReports(req.validated.query);
  res.json(result);
});

export const createReport = asyncHandler(async (req, res) => {
  const payload = normalizeReportPayload(req.validated.body);
  const db = await readDb();
  const patientExists = db.patients.some((patient) => patient._id === payload.patientId);

  if (!patientExists) {
    throw new ApiError(404, 'Patient not found');
  }

  const report = await createReportRecord(payload);
  res.status(201).json(report);
});

export const getReportById = asyncHandler(async (req, res) => {
  const report = await getReportRecord(req.validated.params.id);
  if (!report) {
    throw new ApiError(404, 'Report not found');
  }

  res.json(report);
});

export const updateReport = asyncHandler(async (req, res) => {
  const payload = normalizeReportPayload(req.validated.body);
  const db = await readDb();
  const reportExists = db.reports.some((report) => report._id === req.validated.params.id);
  const patientExists = db.patients.some((patient) => patient._id === payload.patientId);

  if (!reportExists) {
    throw new ApiError(404, 'Report not found');
  }

  if (!patientExists) {
    throw new ApiError(404, 'Patient not found');
  }

  const report = await updateReportRecord(req.validated.params.id, payload);
  res.json(report);
});

export const deleteReport = asyncHandler(async (req, res) => {
  const deleted = await deleteReportRecord(req.validated.params.id);
  if (!deleted) {
    throw new ApiError(404, 'Report not found');
  }
  res.json({ message: 'Report deleted successfully' });
});
