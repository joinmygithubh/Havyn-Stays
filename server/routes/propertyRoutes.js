import { Router } from 'express';
import { body } from 'express-validator';
import {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty,
  getMyListings,
  getPriceStats,
} from '../controllers/propertyController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import validate from '../middleware/validate.js';
import { PROPERTY_TYPES, AMENITIES } from '../models/Property.js';

const router = Router();

const propertyRules = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('propertyType').isIn(PROPERTY_TYPES).withMessage('Invalid property type'),
  body('pricePerNight').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('location.city').trim().notEmpty().withMessage('City is required'),
  body('location.country').trim().notEmpty().withMessage('Country is required'),
  body('images').isArray({ min: 1 }).withMessage('At least one image URL is required'),
  body('images.*').isURL().withMessage('Each image must be a valid URL'),
  body('maxGuests').optional().isInt({ min: 1 }),
  body('bedrooms').optional().isInt({ min: 0 }),
  body('bathrooms').optional().isInt({ min: 0 }),
  body('amenities').optional().isArray(),
  body('amenities.*').optional().isIn(AMENITIES).withMessage('Invalid amenity'),
];

// Host-scoped routes first so "/host/me" is not captured by "/:id".
router.get('/host/me', protect, restrictTo('host', 'admin'), getMyListings);

// Price distribution for the filter UI (static segment before "/:id").
router.get('/stats/prices', getPriceStats);

router.route('/').get(getProperties).post(protect, restrictTo('host', 'admin'), propertyRules, validate, createProperty);

router
  .route('/:id')
  .get(getProperty)
  .put(protect, restrictTo('host', 'admin'), updateProperty)
  .delete(protect, restrictTo('host', 'admin'), deleteProperty);

export default router;
