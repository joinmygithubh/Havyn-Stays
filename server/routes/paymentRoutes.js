import { Router } from 'express';
import { body } from 'express-validator';
import {
  createPayment,
  verifyPayment,
  getPaymentConfig,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

router.get('/config', getPaymentConfig);

router.post(
  '/create',
  protect,
  [body('bookingId').isMongoId().withMessage('Valid bookingId is required')],
  validate,
  createPayment
);

router.post(
  '/verify',
  protect,
  [
    body('bookingId').isMongoId().withMessage('Valid bookingId is required'),
    body('paymentIntentId').notEmpty().withMessage('paymentIntentId is required'),
  ],
  validate,
  verifyPayment
);

export default router;
