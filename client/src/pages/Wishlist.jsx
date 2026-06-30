import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard.jsx';
import { PropertyGridSkeleton } from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import { authService } from '../api/services.js';

/** Saved properties page. */
export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { items: list } = await authService.getWishlist();
        setItems(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Your wishlist</h1>
      <p className="mt-1 text-ink-500">Places you’ve saved for later.</p>

      <div className="mt-8">
        {loading ? (
          <PropertyGridSkeleton count={4} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No saved stays yet"
            message="Tap the heart on any listing to save it here for later."
            action={
              <Link to="/" className="btn-primary">
                Explore stays
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((p) => (
              <PropertyCard key={p._id} property={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
