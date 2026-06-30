import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // never return the hash by default
    },
    avatar: {
      type: String,
      default:
        'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=256&q=80',
    },
    phone: { type: String, trim: true },
    bio: { type: String, maxlength: 500 },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    isHost: { type: Boolean, default: false },
    isSuperhost: { type: Boolean, default: false },
    // Wishlist: array of saved property references.
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Property' }],
  },
  { timestamps: true }
);

/**
 * Hash the password before saving, but only when it has been modified.
 */
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Instance method to compare a plaintext candidate against the stored hash.
 */
userSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

/**
 * Strip sensitive fields whenever a user document is serialized to JSON.
 */
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
