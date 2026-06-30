import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Property from '../models/Property.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { calculatePricing } from '../utils/pricing.js';
import { users, buildProperties, reviewSeeds } from './data.js';

/**
 * Seed script.
 *   npm run seed           → wipe + reseed the database
 *   npm run seed:destroy   → wipe only
 *
 * Demo login:  sam@havyn.dev / password123  (guest)
 *              aria@havyn.dev / password123 (host/superhost)
 */

const wipe = async () => {
  await Promise.all([
    User.deleteMany({}),
    Property.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
  ]);
  console.log('🧹  Cleared existing collections');
};

const seed = async () => {
  await wipe();

  // Create users one-by-one so the password-hashing pre-save hook runs.
  const createdUsers = [];
  for (const u of users) {
    // eslint-disable-next-line no-await-in-loop
    createdUsers.push(await User.create(u));
  }
  console.log(`👤  Created ${createdUsers.length} users`);

  const hostIds = createdUsers.filter((u) => u.isHost).map((u) => u._id);
  const properties = await Property.insertMany(buildProperties(hostIds));
  console.log(`🏡  Created ${properties.length} properties`);

  const guest = createdUsers.find((u) => !u.isHost);

  // Create a few completed + upcoming bookings for the guest so the Trips,
  // earnings, and reviews features have data to display.
  const today = new Date();
  const daysFromNow = (n) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    d.setHours(12, 0, 0, 0);
    return d;
  };

  const bookingsToCreate = [
    { property: properties[0], checkIn: daysFromNow(-30), checkOut: daysFromNow(-25), status: 'Completed', paid: true },
    { property: properties[2], checkIn: daysFromNow(-12), checkOut: daysFromNow(-9), status: 'Completed', paid: true },
    { property: properties[3], checkIn: daysFromNow(14), checkOut: daysFromNow(18), status: 'Confirmed', paid: true },
    { property: properties[6], checkIn: daysFromNow(40), checkOut: daysFromNow(44), status: 'Pending', paid: false },
  ];

  const createdBookings = [];
  for (const b of bookingsToCreate) {
    const pricing = calculatePricing(b.property, b.checkIn, b.checkOut);
    // eslint-disable-next-line no-await-in-loop
    const booking = await Booking.create({
      property: b.property._id,
      guest: guest._id,
      host: b.property.host,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      guests: 2,
      nights: pricing.nights,
      nightlyRate: pricing.nightlyRate,
      cleaningFee: pricing.cleaningFee,
      serviceFee: pricing.serviceFee,
      taxes: pricing.taxes,
      totalAmount: pricing.totalAmount,
      paymentMethod: b.paid ? 'Online' : 'Pay at Property',
      paymentStatus: b.paid ? 'Paid' : 'Pending',
      bookingStatus: b.status,
    });
    createdBookings.push({ booking, property: b.property });
  }
  console.log(`📅  Created ${createdBookings.length} bookings`);

  // Reviews for completed stays (linked to the booking) + fuller, varied
  // reviews on every listing from multiple authors so ratings look realistic.
  const completed = createdBookings.filter((x) => x.booking.bookingStatus === 'Completed');
  let reviewCount = 0;

  // 1) The guest's reviews for their completed stays.
  for (let i = 0; i < completed.length; i += 1) {
    const { booking, property } = completed[i];
    const seed = reviewSeeds[i % reviewSeeds.length];
    // eslint-disable-next-line no-await-in-loop
    await Review.create({
      property: property._id,
      author: guest._id,
      booking: booking._id,
      rating: seed.rating,
      comment: seed.comment,
    }).catch(() => {});
    booking.isReviewed = true;
    // eslint-disable-next-line no-await-in-loop
    await booking.save();
    reviewCount += 1;
  }

  // 2) Additional reviews (2–4 per property) from users other than the host.
  //    The unique {property, author} index naturally de-duplicates.
  let seedIdx = 0;
  for (const property of properties) {
    const hostId = property.host.toString();
    const authors = createdUsers.filter((u) => u._id.toString() !== hostId);
    // Rotate the author order per property so distribution varies.
    const offset = seedIdx % authors.length;
    const rotated = [...authors.slice(offset), ...authors.slice(0, offset)];
    const num = 2 + (seedIdx % 3); // 2, 3 or 4 reviews
    for (let i = 0; i < num && i < rotated.length; i += 1) {
      const seed = reviewSeeds[(seedIdx * 2 + i) % reviewSeeds.length];
      // eslint-disable-next-line no-await-in-loop
      await Review.create({
        property: property._id,
        author: rotated[i]._id,
        rating: seed.rating,
        comment: seed.comment,
      }).catch(() => {}); // ignore unique-index dupes
      reviewCount += 1;
    }
    seedIdx += 1;
  }
  console.log(`⭐  Created ~${reviewCount} reviews`);

  // The Review post-save hook recomputes ratings as fire-and-forget. In a
  // short-lived script we recompute explicitly and await it so the listings
  // are guaranteed up to date before the connection closes.
  const reviewedPropertyIds = await Review.distinct('property');
  await Promise.all(reviewedPropertyIds.map((pid) => Review.recalcPropertyRating(pid)));

  console.log('\n✅  Seed complete!');
  console.log('   Guest login : sam@havyn.dev  / password123');
  console.log('   Host login  : aria@havyn.dev / password123\n');
};

const run = async () => {
  await connectDB();
  try {
    if (process.argv.includes('--destroy')) {
      await wipe();
      console.log('✅  Database wiped');
    } else {
      await seed();
    }
  } catch (err) {
    console.error('✖  Seed failed:', err);
  } finally {
    // Allow any fire-and-forget post-save hooks to settle before disconnecting.
    await new Promise((resolve) => setTimeout(resolve, 400));
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
