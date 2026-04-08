import {
  createPatient as createPatientRecord,
  deletePatient as deletePatientRecord,
  getPatientById as getPatientRecord,
  listPatients,
  updatePatient as updatePatientRecord
} from '../services/dataService.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getPatients = asyncHandler(async (req, res) => {
  const result = await listPatients(req.validated.query);
  res.json(result);
});

export const createPatient = asyncHandler(async (req, res) => {
  const patient = await createPatientRecord(req.validated.body);
  res.status(201).json(patient);
});

export const getPatientById = asyncHandler(async (req, res) => {
  const result = await getPatientRecord(req.validated.params.id);
  if (!result) {
    throw new ApiError(404, 'Patient not found');
  }
  res.json(result);
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await updatePatientRecord(req.validated.params.id, req.validated.body);
  if (!patient) {
    throw new ApiError(404, 'Patient not found');
  }

  res.json(patient);
});

export const deletePatient = asyncHandler(async (req, res) => {
  const deleted = await deletePatientRecord(req.validated.params.id);
  if (!deleted) {
    throw new ApiError(404, 'Patient not found');
  }
  res.json({ message: 'Patient deleted successfully' });
});
