import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './Navbar.jsx';
import BottomNav from './BottomNav.jsx';
import Footer from './Footer.jsx';

/**
 * App shell: persistent navbar + footer + mobile bottom nav, with the routed
 * page rendered in <Outlet>. Scrolls to top on every navigation. Extra bottom
 * padding on mobile keeps content clear of the bottom nav bar.
 */
export default function Layout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
