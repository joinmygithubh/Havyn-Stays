import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageCarousel from '../ui/ImageCarousel.jsx';
import { formatCurrency } from '../../utils/format.js';
import { useWishlistStore } from '../../store/wishlistStore.js';
import { useAuthStore } from '../../store/authStore.js';

/**
 * A single listing card: image carousel, wishlist heart, title, location,
 * rating, and price. The whole card links to the detail page; interactive
 * controls (heart, carousel arrows) stop propagation so they don't navigate.
 */
export default function PropertyCard({ property }) {
  const user = useAuthStore((s) => s.user);
  const saved = useWishlistStore((s) => s.ids.has(property._id));
  const toggle = useWishlistStore((s) => s.toggle);

  const onHeart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast('Log in to save places you love', { icon: '💛' });
      return;
    }
    try {
      const nowSaved = await toggle(property._id);
      toast.success(nowSaved ? 'Saved to wishlist' : 'Removed from wishlist');
    } catch {
      toast.error('Could not update wishlist');
    }
  };

  const { city, state, country } = property.location || {};
  const place = [city, state || country].filter(Boolean).join(', ');

  return (
    <Link to={`/property/${property._id}`} className="group block">
      <div className="relative">
        <ImageCarousel images={property.images} alt={property.title} />

        {/* Wishlist heart */}
        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={onHeart}
          aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
          className="absolute right-3 top-3 z-10"
        >
          <Heart
            size={26}
            className={`drop-shadow transition ${
              saved ? 'fill-coral-500 text-coral-500' : 'fill-black/30 text-white hover:fill-black/40'
            }`}
          />
        </motion.button>

        {/* Badges */}
        <div className="absolute left-3 top-3 z-10 flex gap-1.5">
          {property.isSuperhost && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-ink-800 shadow">
              Superhost
            </span>
          )}
          {property.instantBook && (
            <span className="rounded-full bg-coral-500/95 px-2.5 py-1 text-xs font-semibold text-white shadow">
              Instant book
            </span>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="mt-3 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-1 font-semibold text-ink-900 dark:text-ink-100">{property.title}</h3>
          {property.reviewsCount > 0 && (
            <span className="flex shrink-0 items-center gap-1 text-sm font-medium">
              <Star size={14} className="fill-coral-500 text-coral-500" />
              {property.rating.toFixed(1)}
            </span>
          )}
        </div>
        <p className="line-clamp-1 text-sm text-ink-500">{place}</p>
        <p className="text-sm text-ink-400">
          {property.propertyType} · {property.bedrooms} bd · {property.bathrooms} ba
        </p>
        <p className="mt-1">
          <span className="font-bold text-ink-900 dark:text-ink-100">
            {formatCurrency(property.pricePerNight)}
          </span>
          <span className="text-sm text-ink-500"> / night</span>
        </p>
      </div>
    </Link>
  );
}
