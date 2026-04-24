import { env } from '../config/env.js';
import * as fileStore from './fileDatabase.js';
import * as mongoStore from './mongoDatabase.js';

const activeStore = env.mongoUri ? mongoStore : fileStore;

export const usesMongoDb = Boolean(env.mongoUri);

export const initializeStorage = activeStore.initializeStorage || (async () => {});
export const sanitizeUser = activeStore.sanitizeUser;
export const findUserByEmail = activeStore.findUserByEmail;
export const findUserById = activeStore.findUserById;
export const ensureAdminUser = activeStore.ensureAdminUser;
export const createUser = activeStore.createUser;
export const listPatients = activeStore.listPatients;
export const createPatient = activeStore.createPatient;
export const getPatientById = activeStore.getPatientById;
export const updatePatient = activeStore.updatePatient;
export const deletePatient = activeStore.deletePatient;
export const hasPatient = activeStore.hasPatient || (async (id) => Boolean(await activeStore.getPatientById(id)));
export const hasReport = activeStore.hasReport || (async (id) => Boolean(await activeStore.getReportById(id)));
export const listReports = activeStore.listReports;
export const createReport = activeStore.createReport;
export const getReportById = activeStore.getReportById;
export const updateReport = activeStore.updateReport;
export const deleteReport = activeStore.deleteReport;
export const getDashboardStats = activeStore.getDashboardStats;
export const listReservations = activeStore.listReservations;
export const createReservation = activeStore.createReservation;
export const getReservationAvailability = activeStore.getReservationAvailability;
export const getReservationDateOptions = activeStore.getReservationDateOptions;
export const getReservationById = activeStore.getReservationById;
export const updateReservationByAdmin = activeStore.updateReservationByAdmin;
export const getTodayReservationsOverview = activeStore.getTodayReservationsOverview;
export const seedDatabase = activeStore.seedDatabase;
export const saveUploadedFiles = activeStore.saveUploadedFiles;
export const getUploadStream = activeStore.getUploadStream;
