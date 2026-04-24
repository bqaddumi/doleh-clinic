import { Router } from 'express';
import {
  createReservation,
  getReservationById,
  getReservations,
  updateReservationByAdmin
} from '../controllers/reservationController.js';
import { authorize } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createReservationSchema,
  getReservationsSchema,
  reservationIdSchema,
  updateReservationByAdminSchema
} from '../validators/reservationValidators.js';

const router = Router();

router.get('/', validate(getReservationsSchema), getReservations);
router.post('/', authorize('admin', 'patient'), validate(createReservationSchema), createReservation);
router.get('/:id', validate(reservationIdSchema), getReservationById);
router.put('/:id', authorize('admin'), validate(updateReservationByAdminSchema), updateReservationByAdmin);

export default router;
