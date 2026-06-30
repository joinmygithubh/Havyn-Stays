import { NavLink } from 'react-router-dom';
import { Search, Heart, Briefcase, User } from 'lucide-react';

/**
 * Mobile-only bottom navigation bar (Explore, Wishlist, Trips, Profile).
 * Hidden from `md` breakpoint upward where the navbar covers navigation.
 */
const items = [
  { to: '/', label: 'Explore', icon: Search, end: true },
  { to: '/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/trips', label: 'Trips', icon: Briefcase },
  { to: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-100 bg-white/95 backdrop-blur-md dark:border-ink-800 dark:bg-ink-900/95 md:hidden">
      <ul className="mx-auto flex max-w-md items-center justify-around px-2 py-1.5">
        {items.map(({ to, label, icon: Icon, end }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 rounded-xl px-4 py-1.5 text-[11px] font-medium transition ${
                  isActive ? 'text-coral-500' : 'text-ink-400 hover:text-ink-700'
                }`
              }
            >
              <Icon size={22} />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
