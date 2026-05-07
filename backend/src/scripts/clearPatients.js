import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDatabase } from '../config/db.js';
import { Patient } from '../models/Patient.js';
import { initializeStorage } from '../services/dataService.js';
import { readDb, writeDb } from '../services/fileDatabase.js';

const clearPatients = async () => {
  await initializeStorage();

  if (env.mongoUri) {
    await connectDatabase(env.mongoUri);
    const result = await Patient.deleteMany({});
    console.log(`Cleared ${result.deletedCount} patients from MongoDB.`);
  } else {
    const db = await readDb();
    const count = db.patients.length;
    db.patients = [];
    await writeDb(db);
    console.log(`Cleared ${count} patients from file storage.`);
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

clearPatients().catch(async (error) => {
  console.error('Failed to clear patients:', error.message);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  process.exit(1);
});
