import { initializeStorage, seedDatabase } from '../services/dataService.js';

const seed = async () => {
  await initializeStorage();
  await seedDatabase();
  console.log('Seed completed successfully');
  process.exit(0);
};

seed().catch((error) => {
  console.error('Seed failed', error);
  process.exit(1);
});
