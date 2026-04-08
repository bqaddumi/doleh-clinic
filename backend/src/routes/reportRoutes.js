import { Router } from 'express';
import {
  createReport,
  deleteReport,
  getReportById,
  getReports,
  updateReport
} from '../controllers/reportController.js';
import { validate } from '../middleware/validate.js';
import {
  createReportSchema,
  getReportsSchema,
  reportIdSchema,
  updateReportSchema
} from '../validators/reportValidators.js';

const router = Router();

router.get('/', validate(getReportsSchema), getReports);
router.post('/', validate(createReportSchema), createReport);
router.get('/:id', validate(reportIdSchema), getReportById);
router.put('/:id', validate(updateReportSchema), updateReport);
router.delete('/:id', validate(reportIdSchema), deleteReport);

export default router;
