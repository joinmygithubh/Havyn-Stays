import {
  Home,
  Building2,
  Castle,
  Trees,
  Tent,
  Warehouse,
  Waves,
  TreePine,
  Wifi,
  Waves as Pool,
  Car,
  Snowflake,
  CookingPot,
  PawPrint,
  WashingMachine,
  Tv,
  Bath,
  Dumbbell,
  Briefcase,
  Flame,
  Beef,
  Umbrella,
} from 'lucide-react';

/** Property types — must match the backend enum (Property model). */
export const PROPERTY_TYPES = [
  'Apartment',
  'House',
  'Villa',
  'Cabin',
  'Cottage',
  'Loft',
  'Beachfront',
  'Treehouse',
];

/** Category row shown under the navbar (icon + label). */
export const CATEGORIES = [
  { key: '', label: 'All', icon: Home },
  { key: 'Villa', label: 'Villas', icon: Castle },
  { key: 'Cabin', label: 'Cabins', icon: TreePine },
  { key: 'Beachfront', label: 'Beachfront', icon: Waves },
  { key: 'Apartment', label: 'Apartments', icon: Building2 },
  { key: 'House', label: 'Houses', icon: Home },
  { key: 'Cottage', label: 'Cottages', icon: Warehouse },
  { key: 'Loft', label: 'Lofts', icon: Tent },
  { key: 'Treehouse', label: 'Treehouses', icon: Trees },
];

/** Amenities — must match the backend enum (Property model). */
export const AMENITIES = [
  'WiFi',
  'Pool',
  'Parking',
  'AC',
  'Kitchen',
  'Pet-friendly',
  'Washer',
  'TV',
  'Hot tub',
  'Gym',
  'Workspace',
  'Fireplace',
  'BBQ grill',
  'Beach access',
];

/** Map each amenity to a lucide icon for consistent display. */
export const AMENITY_ICONS = {
  WiFi: Wifi,
  Pool,
  Parking: Car,
  AC: Snowflake,
  Kitchen: CookingPot,
  'Pet-friendly': PawPrint,
  Washer: WashingMachine,
  TV: Tv,
  'Hot tub': Bath,
  Gym: Dumbbell,
  Workspace: Briefcase,
  Fireplace: Flame,
  'BBQ grill': Beef,
  'Beach access': Umbrella,
};

export const SORT_OPTIONS = [
  { value: '', label: 'Recommended' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'newest', label: 'Newest' },
];

/** Fallback image used when a listing photo fails to load. */
export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80&auto=format&fit=crop';

/** Tailwind classes per booking status badge. */
export const STATUS_STYLES = {
  Pending: 'bg-amber-100 text-amber-700',
  Confirmed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-ink-200 text-ink-600',
  Completed: 'bg-coral-100 text-coral-700',
};
