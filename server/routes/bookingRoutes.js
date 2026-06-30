import { Router } from 'express';
import { body } from 'express-validator';
import {
  createBooking,
  getMyBookings,
  getHostBookings,
  getBooking,
  cancelBooking,
  updateBookingStatus,
  checkAvailability,
} from '../controllers/bookingController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

const bookingRules = [
  body('propertyId').isMongoId().withMessage('Valid propertyId is required'),
  body('checkIn').isISO8601().withMessage('Valid check-in date is required'),
  body('checkOut').isISO8601().withMessage('Valid check-out date is required'),
  body('guests').isInt({ min: 1 }).withMessage('At least one guest is required'),
  body('paymentMethod').optional().isIn(['Online', 'Pay at Property']),
];

router.post('/', protect, bookingRules, validate, createBooking);

router.get('/me', protect, getMyBookings);
router.get('/host/me', protect, restrictTo('host', 'admin'), getHostBookings);
router.get('/availability/:propertyId', checkAvailability);

router.get('/:id', protect, getBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/status', protect, restrictTo('host', 'admin'), updateBookingStatus);

export default router;
