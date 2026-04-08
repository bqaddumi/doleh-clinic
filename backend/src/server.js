import { createApp } from './app.js';
import { env } from './config/env.js';
import { initializeStorage } from './services/dataService.js';
import { ensureAdminUser } from './services/bootstrapAdmin.js';

const startServer = async () => {
  try {
    await initializeStorage();
    await ensureAdminUser();

    const app = createApp();
    app.listen(env.port, () => {
      console.log(`Backend server running on port ${env.port}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
