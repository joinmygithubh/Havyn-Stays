import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Users,
  BedDouble,
  Bath,
  Heart,
  Share2,
  Star,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';

import Gallery from '../components/property/Gallery.jsx';
import BookingWidget from '../components/booking/BookingWidget.jsx';
import Reviews from '../components/reviews/Reviews.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { AMENITY_ICONS } from '../utils/constants.js';
import { formatDate, pluralize } from '../utils/format.js';
import { propertyService, bookingService } from '../api/services.js';
import { useAuthStore } from '../store/authStore.js';
import { useWishlistStore } from '../store/wishlistStore.js';

/** Full property detail page with gallery, host info, amenities and booking. */
export default function PropertyDetail() {
  const { id } = useParams();
  const user = useAuthStore((s) => s.user);
  const saved = useWishlistStore((s) => s.ids.has(id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const [property, setProperty] = useState(null);
  const [bookedRanges, setBookedRanges] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const data = await propertyService.get(id);
        if (!active) return;
        setProperty(data.property);
        setBookedRanges(data.bookedRanges || []);
      } catch (err) {
        toast.error(err.message || 'Property not found');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  // Determine if the logged-in user can review (completed, unreviewed stay).
  useEffect(() => {
    if (!user) return setCanReview(false);
    (async () => {
      try {
        const { items } = await bookingService.myBookings();
        const eligible = items.some(
          (b) =>
            (b.property?._id === id || b.property === id) &&
            b.bookingStatus === 'Completed' &&
            !b.isReviewed
        );
        setCanReview(eligible);
      } catch {
        setCanReview(false);
      }
    })();
  }, [user, id]);

  const onShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: property.title, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch {
      /* user cancelled */
    }
  };

  const onSave = async () => {
    if (!user) return toast('Log in to save places you love', { icon: '💛' });
    try {
      const nowSaved = await toggleWishlist(id);
      toast.success(nowSaved ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-coral-500">
        <Spinner size={36} />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="text-2xl font-bold">Property not found</h1>
        <Link to="/" className="btn-primary mt-6">Back to explore</Link>
      </div>
    );
  }

  const { location, host } = property;
  const place = [location.city, location.state, location.country].filter(Boolean).join(', ');

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Title bar */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{property.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-600 dark:text-ink-300">
            {property.reviewsCount > 0 && (
              <span className="flex items-center gap-1 font-medium">
                <Star size={14} className="fill-coral-500 text-coral-500" />
                {property.rating.toFixed(1)} · {pluralize(property.reviewsCount, 'review')}
              </span>
            )}
            {property.isSuperhost && (
              <span className="flex items-center gap-1 font-medium">
                <Award size={14} /> Superhost
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {place}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onShare} className="btn-ghost text-sm">
            <Share2 size={16} /> Share
          </button>
          <button onClick={onSave} className="btn-ghost text-sm">
            <Heart size={16} className={saved ? 'fill-coral-500 text-coral-500' : ''} /> Save
          </button>
        </div>
      </div>

      <Gallery images={property.images} title={property.title} />

      {/* Body */}
      <div className="mt-8 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Host + summary */}
          <div className="flex items-start justify-between border-b border-ink-100 pb-6 dark:border-ink-700">
            <div>
              <h2 className="text-xl font-bold">
                {property.propertyType} hosted by {host?.name}
              </h2>
              <p className="mt-1 text-ink-500">
                {pluralize(property.maxGuests, 'guest')} · {pluralize(property.bedrooms, 'bedroom')} ·{' '}
                {pluralize(property.beds, 'bed')} · {pluralize(property.bathrooms, 'bath')}
              </p>
            </div>
            <img src={host?.avatar} alt={host?.name} className="h-14 w-14 rounded-full object-cover ring-2 ring-coral-100" />
          </div>

          {/* Quick facts */}
          <div className="flex flex-wrap gap-6 border-b border-ink-100 py-6 dark:border-ink-700">
            <Fact icon={Users} label={pluralize(property.maxGuests, 'guest')} />
            <Fact icon={BedDouble} label={pluralize(property.bedrooms, 'bedroom')} />
            <Fact icon={Bath} label={pluralize(property.bathrooms, 'bathroom')} />
          </div>

          {/* Description */}
          <div className="border-b border-ink-100 py-6 dark:border-ink-700">
            <p className="whitespace-pre-line leading-relaxed text-ink-700 dark:text-ink-300">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="border-b border-ink-100 py-6 dark:border-ink-700">
            <h2 className="mb-4 text-xl font-bold">What this place offers</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {property.amenities.map((a) => {
                const Icon = AMENITY_ICONS[a];
                return (
                  <div key={a} className="flex items-center gap-3 text-ink-700 dark:text-ink-300">
                    {Icon && <Icon size={20} className="text-coral-500" />}
                    {a}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Map / location */}
          <div className="border-b border-ink-100 py-6 dark:border-ink-700">
            <h2 className="mb-4 text-xl font-bold">Where you’ll be</h2>
            <div className="relative h-72 overflow-hidden rounded-2xl">
              <iframe
                title="map"
                className="h-full w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.05}%2C${
                  location.lat - 0.05
                }%2C${location.lng + 0.05}%2C${location.lat + 0.05}&layer=mapnik&marker=${location.lat}%2C${location.lng}`}
              />
            </div>
            <p className="mt-3 flex items-center gap-2 text-ink-600 dark:text-ink-300">
              <MapPin size={16} className="text-coral-500" /> {place}
            </p>
          </div>

          {/* Host card */}
          <div className="py-6">
            <div className="flex items-center gap-4">
              <img src={host?.avatar} alt={host?.name} className="h-16 w-16 rounded-full object-cover" />
              <div>
                <h3 className="text-lg font-bold">Hosted by {host?.name}</h3>
                <p className="text-sm text-ink-500">
                  Joined in {formatDate(host?.createdAt, 'MMMM yyyy')}
                  {host?.isSuperhost && ' · Superhost'}
                </p>
              </div>
            </div>
            {host?.bio && <p className="mt-3 max-w-xl text-ink-600 dark:text-ink-300">{host.bio}</p>}
          </div>
        </div>

        {/* Sticky booking widget */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:sticky lg:top-28"
          >
            <BookingWidget property={property} bookedRanges={bookedRanges} />
          </motion.div>
        </div>
      </div>

      {/* Reviews */}
      <Reviews propertyId={property._id} canReview={canReview} />
    </div>
  );
}

function Fact({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 text-ink-700 dark:text-ink-300">
      <Icon size={20} className="text-coral-500" />
      <span className="font-medium">{label}</span>
    </div>
  );
}
