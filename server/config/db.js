import mongoose from 'mongoose';

/**
 * Establish a connection to MongoDB Atlas (or a local instance).
 * The process exits with a non-zero code if the initial connection fails,
 * so orchestrators (pm2, Docker, etc.) can restart the service.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('✖  MONGO_URI is not defined. Check your .env file.');
    process.exit(1);
  }

  try {
    // `strictQuery` avoids silently ignoring unknown query fields.
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✔  MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`✖  MongoDB runtime error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠  MongoDB disconnected.');
    });
  } catch (err) {
    console.error(`✖  MongoDB connection failed: ${err.message}`);
    process.exit(1);
  }
};

export default connectDB;
