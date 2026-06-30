import { Router } from 'express';
import { body } from 'express-validator';
import {
  createReview,
  getPropertyReviews,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

const reviewRules = [
  body('propertyId').isMongoId().withMessage('Valid propertyId is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 5 }).withMessage('Review must be at least 5 characters'),
];

router.post('/', protect, reviewRules, validate, createReview);
router.get('/:propertyId', getPropertyReviews);
router.delete('/:id', protect, deleteReview);

export default router;
