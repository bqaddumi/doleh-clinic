import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/db.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const values = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--') {
      continue;
    }

    if (!arg.startsWith('--')) {
      continue;
    }

    const key = arg.slice(2);
    values[key] = args[index + 1];
    index += 1;
  }

  return values;
};

const main = async () => {
  const args = parseArgs();
  const fullName = args.name?.trim();
  const email = args.email?.trim().toLowerCase();
  const password = args.password?.trim();

  if (!env.mongoUri) {
    throw new Error('MONGODB_URI is required to create a MongoDB user');
  }

  if (!fullName || !email || !password) {
    throw new Error('Usage: npm run create-user -- --name "User Name" --email "user@example.com" --password "StrongPass123!"');
  }

  if (password.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  await connectDatabase(env.mongoUri);

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.findOneAndUpdate(
    { email },
    {
      fullName,
      email,
      password: hashedPassword,
      role: 'admin'
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true
    }
  );

  console.log(`User ready: ${user.email}`);
  console.log(`Name: ${user.fullName}`);
  console.log(`Role: ${user.role}`);

  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error(error.message);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  process.exit(1);
});
