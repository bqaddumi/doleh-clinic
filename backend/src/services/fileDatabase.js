import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.resolve(__dirname, '../data');
const dataFilePath = path.join(dataDirectory, 'db.json');

const defaultDb = {
  users: [],
  patients: [],
  reports: []
};

const sortByDateDesc = (a, b, field) => new Date(b[field]).getTime() - new Date(a[field]).getTime();

const ensureDataFile = async () => {
  await mkdir(dataDirectory, { recursive: true });

  try {
    await readFile(dataFilePath, 'utf8');
  } catch {
    await writeFile(dataFilePath, JSON.stringify(defaultDb, null, 2));
  }
};

export const initializeStorage = async () => {
  await ensureDataFile();
};

export const readDb = async () => {
  await ensureDataFile();
  const content = await readFile(dataFilePath, 'utf8');
  return JSON.parse(content);
};

export const writeDb = async (db) => {
  await ensureDataFile();
  await writeFile(dataFilePath, JSON.stringify(db, null, 2));
  return db;
};

export const resetDb = async () => writeDb(structuredClone(defaultDb));

export const sanitizeUser = (user) => ({
  _id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

export const findUserByEmail = async (email) => {
  const db = await readDb();
  return db.users.find((user) => user.email === email.toLowerCase()) || null;
};

export const findUserById = async (id) => {
  const db = await readDb();
  return db.users.find((user) => user._id === id) || null;
};

export const ensureAdminUser = async () => {
  const db = await readDb();
  const email = env.adminEmail.toLowerCase();
  const existing = db.users.find((user) => user.email === email);

  if (existing) {
    return existing;
  }

  const now = new Date().toISOString();
  const user = {
    _id: randomUUID(),
    fullName: 'Clinic Administrator',
    email,
    password: await bcrypt.hash(env.adminPassword, 10),
    role: 'admin',
    createdAt: now,
    updatedAt: now
  };

  db.users.push(user);
  await writeDb(db);
  return user;
};

export const listPatients = async ({ search = '', page, limit, sortBy, sortOrder }) => {
  const db = await readDb();
  const query = search.trim().toLowerCase();

  let items = db.patients.filter((patient) => {
    if (!query) {
      return true;
    }

    return [patient.fullName, patient.phone, patient.condition].some((value) =>
      value.toLowerCase().includes(query)
    );
  });

  items = items.sort((a, b) => {
    const direction = sortOrder === 'asc' ? 1 : -1;

    if (sortBy === 'age') {
      return (a.age - b.age) * direction;
    }

    if (sortBy === 'lastVisit') {
      const aValue = a.lastVisit ? new Date(a.lastVisit).getTime() : 0;
      const bValue = b.lastVisit ? new Date(b.lastVisit).getTime() : 0;
      return (aValue - bValue) * direction;
    }

    const aValue = String(a[sortBy] || '').toLowerCase();
    const bValue = String(b[sortBy] || '').toLowerCase();
    return aValue.localeCompare(bValue) * direction;
  });

  const total = items.length;
  const start = (page - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
};

export const createPatient = async (payload) => {
  const db = await readDb();
  const now = new Date().toISOString();
  const patient = {
    _id: randomUUID(),
    fullName: payload.fullName,
    phone: payload.phone,
    age: payload.age,
    gender: payload.gender,
    address: payload.address || '',
    condition: payload.condition,
    notes: payload.notes || '',
    lastVisit: null,
    createdAt: now,
    updatedAt: now
  };

  db.patients.push(patient);
  await writeDb(db);
  return patient;
};

export const getPatientById = async (patientId) => {
  const db = await readDb();
  const patient = db.patients.find((item) => item._id === patientId) || null;

  if (!patient) {
    return null;
  }

  const reports = db.reports
    .filter((report) => report.patientId === patientId)
    .sort((a, b) => sortByDateDesc(a, b, 'date'));

  return { patient, reports };
};

export const updatePatient = async (patientId, payload) => {
  const db = await readDb();
  const index = db.patients.findIndex((item) => item._id === patientId);

  if (index === -1) {
    return null;
  }

  const updated = {
    ...db.patients[index],
    ...payload,
    address: payload.address || '',
    notes: payload.notes || '',
    updatedAt: new Date().toISOString()
  };

  db.patients[index] = updated;
  await writeDb(db);
  return updated;
};

export const deletePatient = async (patientId) => {
  const db = await readDb();
  const patientExists = db.patients.some((item) => item._id === patientId);

  if (!patientExists) {
    return false;
  }

  db.patients = db.patients.filter((item) => item._id !== patientId);
  db.reports = db.reports.filter((item) => item.patientId !== patientId);
  await writeDb(db);
  return true;
};

export const hasPatient = async (patientId) => {
  const db = await readDb();
  return db.patients.some((item) => item._id === patientId);
};

const populateReportPatient = (report, patients, fields = ['_id', 'fullName', 'phone', 'condition']) => {
  const patient = patients.find((item) => item._id === report.patientId);

  if (!patient) {
    return report;
  }

  return {
    ...report,
    patientId: fields.reduce((accumulator, field) => {
      accumulator[field] = patient[field];
      return accumulator;
    }, {})
  };
};

export const listReports = async ({ patientId, dateFrom, dateTo, page, limit }) => {
  const db = await readDb();

  let items = db.reports.filter((report) => {
    if (patientId && report.patientId !== patientId) {
      return false;
    }

    const reportDate = new Date(report.date).getTime();
    if (dateFrom && reportDate < new Date(dateFrom).getTime()) {
      return false;
    }
    if (dateTo && reportDate > new Date(dateTo).getTime()) {
      return false;
    }

    return true;
  });

  items = items.sort((a, b) => {
    const byDate = sortByDateDesc(a, b, 'date');
    return byDate !== 0 ? byDate : sortByDateDesc(a, b, 'createdAt');
  });

  const total = items.length;
  const start = (page - 1) * limit;

  return {
    items: items
      .slice(start, start + limit)
      .map((report) => populateReportPatient(report, db.patients)),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit))
    }
  };
};

export const createReport = async (payload) => {
  const db = await readDb();
  const patientIndex = db.patients.findIndex((item) => item._id === payload.patientId);

  if (patientIndex === -1) {
    return null;
  }

  const now = new Date().toISOString();
  const report = {
    _id: randomUUID(),
    patientId: payload.patientId,
    date: new Date(payload.date).toISOString(),
    diagnosis: payload.diagnosis,
    treatmentPlan: payload.treatmentPlan,
    sessionNotes: payload.sessionNotes,
    progress: payload.progress,
    attachments: payload.attachments || [],
    createdAt: now,
    updatedAt: now
  };

  db.reports.push(report);
  db.patients[patientIndex] = {
    ...db.patients[patientIndex],
    lastVisit: report.date,
    updatedAt: now
  };

  await writeDb(db);
  return populateReportPatient(report, db.patients);
};

export const getReportById = async (reportId) => {
  const db = await readDb();
  const report = db.reports.find((item) => item._id === reportId);

  if (!report) {
    return null;
  }

  return populateReportPatient(report, db.patients, [
    '_id',
    'fullName',
    'phone',
    'age',
    'gender',
    'condition'
  ]);
};

export const updateReport = async (reportId, payload) => {
  const db = await readDb();
  const reportIndex = db.reports.findIndex((item) => item._id === reportId);
  const patientExists = db.patients.some((item) => item._id === payload.patientId);

  if (reportIndex === -1 || !patientExists) {
    return null;
  }

  const updated = {
    ...db.reports[reportIndex],
    ...payload,
    date: new Date(payload.date).toISOString(),
    attachments: payload.attachments || [],
    updatedAt: new Date().toISOString()
  };

  db.reports[reportIndex] = updated;

  for (const patient of db.patients) {
    const latest = db.reports
      .filter((report) => report.patientId === patient._id)
      .sort((a, b) => sortByDateDesc(a, b, 'date'))[0];

    patient.lastVisit = latest?.date || null;
  }

  await writeDb(db);
  return populateReportPatient(updated, db.patients);
};

export const deleteReport = async (reportId) => {
  const db = await readDb();
  const report = db.reports.find((item) => item._id === reportId);

  if (!report) {
    return false;
  }

  db.reports = db.reports.filter((item) => item._id !== reportId);

  const patient = db.patients.find((item) => item._id === report.patientId);
  if (patient) {
    const latest = db.reports
      .filter((item) => item.patientId === patient._id)
      .sort((a, b) => sortByDateDesc(a, b, 'date'))[0];
    patient.lastVisit = latest?.date || null;
    patient.updatedAt = new Date().toISOString();
  }

  await writeDb(db);
  return true;
};

export const hasReport = async (reportId) => {
  const db = await readDb();
  return db.reports.some((item) => item._id === reportId);
};

export const getDashboardStats = async () => {
  const db = await readDb();
  const recentPatients = [...db.patients]
    .sort((a, b) => sortByDateDesc(a, b, 'createdAt'))
    .slice(0, 5);

  const progressCounts = db.reports.reduce(
    (accumulator, report) => {
      accumulator[report.progress] = (accumulator[report.progress] || 0) + 1;
      return accumulator;
    },
    { improving: 0, stable: 0, worse: 0 }
  );

  const conditionMap = db.patients.reduce((accumulator, patient) => {
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

  for (const report of db.reports) {
    const date = new Date(report.date);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    if (reportTrendMap.has(key)) {
      reportTrendMap.get(key).value += 1;
    }
  }

  return {
    totalPatients: db.patients.length,
    totalReports: db.reports.length,
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
  const now = new Date();
  const firstDate = new Date(now);
  const secondDate = new Date(now);
  secondDate.setDate(secondDate.getDate() - 2);

  const adminPassword = await bcrypt.hash(env.adminPassword, 10);

  const patients = [
    {
      _id: randomUUID(),
      fullName: 'Nora Hassan',
      phone: '+972501234567',
      age: 34,
      gender: 'female',
      address: '12 Olive Street',
      condition: 'Lower back pain',
      notes: 'Works desk job, symptoms worsen after long sitting.',
      lastVisit: firstDate.toISOString()
    },
    {
      _id: randomUUID(),
      fullName: 'Omar Khalil',
      phone: '+972509876543',
      age: 46,
      gender: 'male',
      address: '88 Palm Avenue',
      condition: 'Post knee surgery rehabilitation',
      notes: 'Twice-weekly follow-up sessions.',
      lastVisit: secondDate.toISOString()
    },
    {
      _id: randomUUID(),
      fullName: 'Lina Saeed',
      phone: '+972522220001',
      age: 29,
      gender: 'female',
      address: '4 Cedar Road',
      condition: 'Neck strain',
      notes: 'Improving with posture correction plan.',
      lastVisit: null
    }
  ].map((patient) => ({
    ...patient,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  }));

  const reports = [
    {
      _id: randomUUID(),
      patientId: patients[0]._id,
      date: firstDate.toISOString(),
      diagnosis: 'Mechanical lower back pain with mild muscle spasm',
      treatmentPlan: 'Stretching, manual therapy, core strengthening sessions twice weekly',
      sessionNotes: 'Patient tolerated treatment well and reported reduced stiffness.',
      progress: 'improving',
      attachments: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    },
    {
      _id: randomUUID(),
      patientId: patients[1]._id,
      date: secondDate.toISOString(),
      diagnosis: 'Post-operative knee stiffness',
      treatmentPlan: 'ROM work, gait training, quadriceps activation',
      sessionNotes: 'Flexion improved by 5 degrees compared to previous visit.',
      progress: 'stable',
      attachments: [],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString()
    }
  ];

  await writeDb({
    users: [
      {
        _id: randomUUID(),
        fullName: 'Clinic Administrator',
        email: env.adminEmail.toLowerCase(),
        password: adminPassword,
        role: 'admin',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ],
    patients,
    reports
  });
};
