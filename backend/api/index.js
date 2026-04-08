import app from '../src/app.js';
import { ensureAdminUser } from '../src/services/bootstrapAdmin.js';

let initialized = false;

const initialize = async () => {
  if (!initialized) {
    await ensureAdminUser();
    initialized = true;
  }
};

export default async function handler(req, res) {
  await initialize();
  return app(req, res);
}
