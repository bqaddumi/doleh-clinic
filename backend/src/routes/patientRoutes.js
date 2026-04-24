import { Router } from 'express';
import {
  createPatient,
  deletePatient,
  getPatientById,
  getPatients,
  updatePatient
} from '../controllers/patientController.js';
import { validate } from '../middleware/validate.js';
import {
  createPatientSchema,
  getPatientsSchema,
  patientIdSchema,
  updatePatientSchema
} from '../validators/patientValidators.js';
import { authorize } from '../middleware/authMiddleware.js';

const router = Router();

router.use(authorize('admin'));

router.get('/', validate(getPatientsSchema), getPatients);
router.post('/', validate(createPatientSchema), createPatient);
router.get('/:id', validate(patientIdSchema), getPatientById);
router.put('/:id', validate(updatePatientSchema), updatePatient);
router.delete('/:id', validate(patientIdSchema), deletePatient);

export default router;
