import { Router } from 'express';
import {
  createPublicReservation,
  getReservationAvailability,
  getReservationDateOptions,
  getTodayReservationsOverview
} from '../controllers/reservationController.js';
import { attachUserIfPresent } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validate.js';
import {
  createReservationSchema,
  reservationAvailabilitySchema,
  reservationDateOptionsSchema
} from '../validators/reservationValidators.js';

const router = Router();

router.get('/today', getTodayReservationsOverview);
router.get('/availability', validate(reservationAvailabilitySchema), getReservationAvailability);
router.get('/date-options', validate(reservationDateOptionsSchema), getReservationDateOptions);
router.post('/', attachUserIfPresent, validate(createReservationSchema), createPublicReservation);

export default router;
