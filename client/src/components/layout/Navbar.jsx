import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Menu,
  Moon,
  Sun,
  Heart,
  Briefcase,
  LayoutDashboard,
  User as UserIcon,
  LogOut,
  Globe,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../ui/Logo.jsx';
import Modal from '../ui/Modal.jsx';
import SearchBar from '../search/SearchBar.jsx';
import { useAuthStore } from '../../store/authStore.js';
import { useTheme } from '../../hooks/useTheme.js';

/**
 * Sticky top navigation: brand, a search pill that opens the search modal,
 * a "Become a host" / host link, a dark-mode toggle, and a profile dropdown.
 */
export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggle } = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the profile dropdown when clicking outside.
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    toast.success('Signed out');
    navigate('/');
  };

  const goHost = () => {
    setMenuOpen(false);
    if (user?.isHost) navigate('/host');
    else navigate('/profile'); // become-a-host CTA lives on the profile page
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur-md dark:border-ink-800 dark:bg-ink-900/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <Link to="/" aria-label="Havyn home">
            <Logo className="hidden sm:inline-flex" />
            <Logo compact className="sm:hidden" />
          </Link>

          {/* Center search pill (desktop) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden items-center gap-3 rounded-full border border-ink-200 bg-white py-2 pl-5 pr-2 text-sm font-medium shadow-pill transition hover:shadow-card dark:border-ink-700 dark:bg-ink-800 md:flex"
          >
            <span>Anywhere</span>
            <span className="h-4 w-px bg-ink-200 dark:bg-ink-700" />
            <span>Any week</span>
            <span className="h-4 w-px bg-ink-200 dark:bg-ink-700" />
            <span className="text-ink-400">Add guests</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-coral-500 text-white">
              <Search size={16} />
            </span>
          </button>

          {/* Right cluster */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button onClick={goHost} className="btn-ghost hidden text-sm lg:inline-flex">
              {user?.isHost ? 'Host dashboard' : 'Become a host'}
            </button>

            <button
              onClick={toggle}
              aria-label="Toggle theme"
              className="hidden rounded-full p-2.5 text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 sm:inline-flex"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              aria-label="Language"
              className="hidden rounded-full p-2.5 text-ink-600 transition hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800 sm:inline-flex"
            >
              <Globe size={18} />
            </button>

            {/* Search trigger (mobile) */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="rounded-full p-2.5 text-ink-700 transition hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800 md:hidden"
            >
              <Search size={20} />
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-ink-200 py-1.5 pl-3 pr-1.5 transition hover:shadow-pill dark:border-ink-700"
              >
                <Menu size={16} className="text-ink-600 dark:text-ink-300" />
                {user ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink-700 text-white">
                    <UserIcon size={16} />
                  </span>
                )}
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-ink-100 bg-white py-2 shadow-card-hover dark:border-ink-700 dark:bg-ink-800"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2">
                          <p className="truncate text-sm font-bold">{user.name}</p>
                          <p className="truncate text-xs text-ink-500">{user.email}</p>
                        </div>
                        <div className="my-1 h-px bg-ink-100 dark:bg-ink-700" />
                        <DropdownLink to="/trips" icon={Briefcase} label="My trips" onClick={() => setMenuOpen(false)} />
                        <DropdownLink to="/wishlist" icon={Heart} label="Wishlist" onClick={() => setMenuOpen(false)} />
                        <DropdownLink to="/profile" icon={UserIcon} label="Profile" onClick={() => setMenuOpen(false)} />
                        {user.isHost && (
                          <DropdownLink to="/host" icon={LayoutDashboard} label="Host dashboard" onClick={() => setMenuOpen(false)} />
                        )}
                        <button onClick={toggle} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-ink-50 dark:hover:bg-ink-700 sm:hidden">
                          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />} Toggle theme
                        </button>
                        <div className="my-1 h-px bg-ink-100 dark:bg-ink-700" />
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-coral-600 transition hover:bg-ink-50 dark:hover:bg-ink-700"
                        >
                          <LogOut size={17} /> Log out
                        </button>
                      </>
                    ) : (
                      <>
                        <DropdownLink to="/login" icon={UserIcon} label="Log in" onClick={() => setMenuOpen(false)} bold />
                        <DropdownLink to="/signup" icon={UserIcon} label="Sign up" onClick={() => setMenuOpen(false)} />
                        <div className="my-1 h-px bg-ink-100 dark:bg-ink-700" />
                        <button onClick={goHost} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-ink-50 dark:hover:bg-ink-700">
                          <LayoutDashboard size={17} /> Become a host
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </header>

      {/* Search modal (reused on all breakpoints) */}
      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title="Search stays">
        <SearchBar variant="modal" onDone={() => setSearchOpen(false)} />
      </Modal>
    </>
  );
}

function DropdownLink({ to, icon: Icon, label, onClick, bold }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition hover:bg-ink-50 dark:hover:bg-ink-700 ${
        bold ? 'font-semibold' : ''
      }`}
    >
      <Icon size={17} /> {label}
    </Link>
  );
}
