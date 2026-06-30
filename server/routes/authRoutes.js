import { Router } from 'express';
import { body } from 'express-validator';
import {
  signup,
  login,
  logout,
  getMe,
  updateMe,
  becomeHost,
  getWishlist,
  toggleWishlist,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import validate from '../middleware/validate.js';

const router = Router();

const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 80 }),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

const loginRules = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/signup', signupRules, validate, signup);
router.post('/login', loginRules, validate, login);
router.post('/logout', logout);

router.get('/me', protect, getMe);
router.put('/me', protect, updateMe);
router.post('/become-host', protect, becomeHost);

router.get('/wishlist', protect, getWishlist);
router.post('/wishlist/:propertyId', protect, toggleWishlist);

export default router;
