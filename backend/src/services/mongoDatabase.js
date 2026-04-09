import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { connectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import { Patient } from '../models/Patient.js';
import { Report } from '../models/Report.js';
import { User } from '../models/User.js';

let connectionPromise;
let gridFsBucket;

const ensureConnection = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!connectionPromise) {
    connectionPromise = connectDatabase(env.mongoUri);
  }

  await connectionPromise;

  if (!gridFsBucket) {
    gridFsBucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
      bucketName: 'attachments'
    });
  }
};

const toPlain = (value) => {
  if (!value) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toPlain(item));
  }

  if (typeof value.toObject === 'function') {
    return value.toObject();
  }

  return value;
};

const sortByDateDesc = (a, b, field) => new Date(b[field]).getTime() - new Date(a[field]).getTime();

export const initializeStorage = async () => {
  await ensureConnection();
};

export const sanitizeUser = (user) => {
  const plain = toPlain(user);
  return {
    _id: String(plain._id),
    fullName: plain.fullName,
    email: plain.email,
    role: plain.role,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt
  };
};

export const findUserByEmail = async (email) => {
  await ensureConnection();
  return User.findOne({ email: email.toLowerCase() });
};

export const findUserById = async (id) => {
  await ensureConnection();
  return User.findById(id);
};

export const ensureAdminUser = async () => {
  await ensureConnection();
  const email = env.adminEmail.toLowerCase();
  const existing = await User.findOne({ email });

  if (existing) {
    return existing;
  }

  return User.create({
    fullName: 'Clinic Administrator',
    email,
    password: await bcrypt.hash(env.adminPassword, 10),
    role: 'admin'
  });
};

export const listPatients = async ({ search = '', page, limit, sortBy, sortOrder }) => {
  await ensureConnection();
  const filter = search
    ? {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { condition: { $regex: search, $options: 'i' } }
        ]
      }
    : {};

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    Patient.find(filter).sort(sort).skip(skip).limit(limit),
    Patient.countDocuments(filter)
  ]);

  return {
    items: toPlain(items),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
};

export const createPatient = async (payload) => {
  await ensureConnection();
  const patient = await Patient.create(payload);
  return toPlain(patient);
};

export const getPatientById = async (patientId) => {
  await ensureConnection();
  const patient = await Patient.findById(patientId);

  if (!patient) {
    return null;
  }

  const reports = await Report.find({ patientId }).sort({ date: -1 });
  return { patient: toPlain(patient), reports: toPlain(reports) };
};

export const updatePatient = async (patientId, payload) => {
  await ensureConnection();
  const patient = await Patient.findByIdAndUpdate(patientId, payload, {
    new: true,
    runValidators: true
  });

  return toPlain(patient);
};

export const deletePatient = async (patientId) => {
  await ensureConnection();
  const patient = await Patient.findById(patientId);

  if (!patient) {
    return false;
  }

  await Promise.all([Patient.deleteOne({ _id: patientId }), Report.deleteMany({ patientId })]);
  return true;
};

export const hasPatient = async (patientId) => {
  await ensureConnection();
  return Boolean(await Patient.exists({ _id: patientId }));
};

export const hasReport = async (reportId) => {
  await ensureConnection();
  return Boolean(await Report.exists({ _id: reportId }));
};

export const listReports = async ({ patientId, dateFrom, dateTo, page, limit }) => {
  await ensureConnection();
  const filter = {};

  if (patientId) {
    filter.patientId = patientId;
  }
  if (dateFrom || dateTo) {
    filter.date = {};
    if (dateFrom) {
      filter.date.$gte = new Date(dateFrom);
    }
    if (dateTo) {
      filter.date.$lte = new Date(dateTo);
    }
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Report.find(filter)
      .populate('patientId', 'fullName phone condition')
      .sort({ date: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Report.countDocuments(filter)
  ]);

  return {
    items: toPlain(items),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
};

export const createReport = async (payload) => {
  await ensureConnection();
  const report = await Report.create({
    ...payload,
    date: new Date(payload.date)
  });

  await Patient.findByIdAndUpdate(payload.patientId, {
    lastVisit: new Date(payload.date)
  });

  const populated = await Report.findById(report._id).populate('patientId', 'fullName phone condition');
  return toPlain(populated);
};

export const getReportById = async (reportId) => {
  await ensureConnection();
  const report = await Report.findById(reportId).populate('patientId', 'fullName phone age gender condition');
  return toPlain(report);
};

export const updateReport = async (reportId, payload) => {
  await ensureConnection();
  const existing = await Report.findById(reportId);

  if (!existing) {
    return null;
  }

  const oldPatientId = String(existing.patientId);
  await Report.findByIdAndUpdate(
    reportId,
    {
      ...payload,
      date: new Date(payload.date)
    },
    { new: true, runValidators: true }
  );

  const recalcLastVisit = async (patientId) => {
    const latest = await Report.findOne({ patientId }).sort({ date: -1 });
    await Patient.findByIdAndUpdate(patientId, {
      lastVisit: latest?.date || null
    });
  };

  await Promise.all([recalcLastVisit(oldPatientId), recalcLastVisit(payload.patientId)]);

  const populated = await Report.findById(reportId).populate('patientId', 'fullName phone condition');
  return toPlain(populated);
};

export const deleteReport = async (reportId) => {
  await ensureConnection();
  const report = await Report.findById(reportId);

  if (!report) {
    return false;
  }

  const patientId = String(report.patientId);
  await Report.deleteOne({ _id: reportId });

  const latest = await Report.findOne({ patientId }).sort({ date: -1 });
  await Patient.findByIdAndUpdate(patientId, {
    lastVisit: latest?.date || null
  });

  return true;
};

export const getDashboardStats = async () => {
  await ensureConnection();
  const [patients, reports] = await Promise.all([Patient.find(), Report.find()]);

  const recentPatients = [...toPlain(patients)].sort((a, b) => sortByDateDesc(a, b, 'createdAt')).slice(0, 5);

  const progressCounts = reports.reduce(
    (accumulator, report) => {
      accumulator[report.progress] = (accumulator[report.progress] || 0) + 1;
      return accumulator;
    },
    { improving: 0, stable: 0, worse: 0 }
  );

  const conditionMap = patients.reduce((accumulator, patient) => {
    accumulator.set(patient.condition, (accumulator.get(patient.condition) || 0) + 1);
    return accumulator;
  }, new Map());

  const conditionBreakdown = [...conditionMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const reportTrendMap = new Map();
  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    reportTrendMap.set(key, {
      label: date.toLocaleString('en-US', { month: 'short' }),
      value: 0
    });
  }

  for (const report of reports) {
    const date = new Date(report.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (reportTrendMap.has(key)) {
      reportTrendMap.get(key).value += 1;
    }
  }

  return {
    totalPatients: patients.length,
    totalReports: reports.length,
    recentPatients,
    charts: {
      progressBreakdown: [
        { label: 'improving', value: progressCounts.improving },
        { label: 'stable', value: progressCounts.stable },
        { label: 'worse', value: progressCounts.worse }
      ],
      conditionBreakdown,
      reportTrend: [...reportTrendMap.values()]
    }
  };
};

export const seedDatabase = async () => {
  await ensureConnection();
  await Promise.all([User.deleteMany({}), Patient.deleteMany({}), Report.deleteMany({})]);

  const now = new Date();
  const firstDate = new Date(now);
  const secondDate = new Date(now);
  secondDate.setDate(secondDate.getDate() - 2);

  await User.create({
    fullName: 'Clinic Administrator',
    email: env.adminEmail.toLowerCase(),
    password: await bcrypt.hash(env.adminPassword, 10),
    role: 'admin'
  });

  const patients = await Patient.insertMany([
    {
      fullName: 'Nora Hassan',
      phone: '+972501234567',
      age: 34,
      gender: 'female',
      address: '12 Olive Street',
      condition: 'Lower back pain',
      notes: 'Works desk job, symptoms worsen after long sitting.',
      lastVisit: firstDate
    },
    {
      fullName: 'Omar Khalil',
      phone: '+972509876543',
      age: 46,
      gender: 'male',
      address: '88 Palm Avenue',
      condition: 'Post knee surgery rehabilitation',
      notes: 'Twice-weekly follow-up sessions.',
      lastVisit: secondDate
    },
    {
      fullName: 'Lina Saeed',
      phone: '+972522220001',
      age: 29,
      gender: 'female',
      address: '4 Cedar Road',
      condition: 'Neck strain',
      notes: 'Improving with posture correction plan.'
    }
  ]);

  await Report.insertMany([
    {
      patientId: patients[0]._id,
      date: firstDate,
      diagnosis: 'Mechanical lower back pain with mild muscle spasm',
      treatmentPlan: 'Stretching, manual therapy, core strengthening sessions twice weekly',
      sessionNotes: 'Patient tolerated treatment well and reported reduced stiffness.',
      progress: 'improving',
      attachments: []
    },
    {
      patientId: patients[1]._id,
      date: secondDate,
      diagnosis: 'Post-operative knee stiffness',
      treatmentPlan: 'ROM work, gait training, quadriceps activation',
      sessionNotes: 'Flexion improved by 5 degrees compared to previous visit.',
      progress: 'stable',
      attachments: []
    }
  ]);
};

export const saveUploadedFiles = async (files, baseUrl) => {
  await ensureConnection();

  const uploaded = await Promise.all(
    files.map(
      (file) =>
        new Promise((resolve, reject) => {
          const fileId = new mongoose.Types.ObjectId();
          const uploadStream = gridFsBucket.openUploadStreamWithId(fileId, `${randomUUID()}-${file.originalname}`, {
            contentType: file.mimetype,
            metadata: {
              originalName: file.originalname
            }
          });

          uploadStream.on('error', reject);
          uploadStream.on('finish', () =>
            resolve({
              id: String(fileId),
              filename: file.originalname,
              contentType: file.mimetype,
              size: file.size,
              url: `${baseUrl}/api/uploads/${String(fileId)}`
            })
          );

          uploadStream.end(file.buffer);
        })
    )
  );

  return uploaded;
};

export const getUploadStream = async (fileId) => {
  await ensureConnection();

  if (!mongoose.Types.ObjectId.isValid(fileId)) {
    return null;
  }

  const files = await mongoose.connection.db
    .collection('attachments.files')
    .find({ _id: new mongoose.Types.ObjectId(fileId) })
    .limit(1)
    .toArray();

  if (!files.length) {
    return null;
  }

  const file = files[0];

  return {
    filename: file.metadata?.originalName || file.filename,
    contentType: file.contentType,
    stream: gridFsBucket.openDownloadStream(new mongoose.Types.ObjectId(fileId))
  };
};
