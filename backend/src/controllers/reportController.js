import {
  createReport as createReportRecord,
  deleteReport as deleteReportRecord,
  getReportById as getReportRecord,
  hasPatient,
  hasReport,
  listReports,
  updateReport as updateReportRecord
} from '../services/dataService.js';
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
  if (!(await hasPatient(payload.patientId))) {
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
  if (!(await hasReport(req.validated.params.id))) {
    throw new ApiError(404, 'Report not found');
  }

  if (!(await hasPatient(payload.patientId))) {
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
