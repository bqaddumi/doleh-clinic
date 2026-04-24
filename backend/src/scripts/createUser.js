import mongoose from 'mongoose';
import { initializeStorage, createUser } from '../services/dataService.js';

const parseArgs = () => {
  const args = process.argv.slice(2);
  const values = {};

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === '--' || !arg.startsWith('--')) {
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
  const role = args.role?.trim().toLowerCase() || 'admin';

  if (!fullName || !email || !password) {
    throw new Error('Usage: npm run create-user -- --name "User Name" --email "user@example.com" --password "StrongPass123!" --role admin');
  }

  if (!['admin', 'patient'].includes(role)) {
    throw new Error('Role must be either admin or patient');
  }

  await initializeStorage();
  const user = await createUser({
    fullName,
    email,
    password,
    role
  });

  console.log(`User ready: ${user.email}`);
  console.log(`Name: ${user.fullName}`);
  console.log(`Role: ${user.role}`);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};

main().catch(async (error) => {
  console.error(error.message);

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  process.exit(1);
});
