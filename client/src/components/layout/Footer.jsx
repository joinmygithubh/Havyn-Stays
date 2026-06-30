import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Twitter, Globe } from 'lucide-react';
import Logo from '../ui/Logo.jsx';

/**
 * Site footer: brand blurb + socials, link columns, a contact block with a
 * dummy address/phone/email, and a small embedded map of the HQ location.
 * (Contact details are placeholder/sample data for this demo project.)
 */
export default function Footer() {
  const columns = [
    { title: 'Support', links: ['Help Center', 'Safety information', 'Cancellation options', 'Report a concern'] },
    { title: 'Community', links: ['Havyn for hosts', 'Referrals', 'Gift cards', 'Community forum'] },
    { title: 'Company', links: ['About', 'Careers', 'Press', 'Sustainability'] },
  ];

  // Dummy HQ coordinates (San Francisco) for the embedded map.
  const lat = 37.7793;
  const lng = -122.4193;
  const bbox = `${lng - 0.012}%2C${lat - 0.008}%2C${lng + 0.012}%2C${lat + 0.008}`;

  const socials = [
    { Icon: Instagram, label: 'Instagram' },
    { Icon: Twitter, label: 'Twitter' },
    { Icon: Facebook, label: 'Facebook' },
    { Icon: Globe, label: 'Website' },
  ];

  return (
    <footer className="mt-16 border-t border-ink-100 bg-ink-50/60 dark:border-ink-800 dark:bg-ink-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-ink-500">
              Find your haven, anywhere. Unique stays and experiences hand-picked for every kind of traveler.
            </p>
            <div className="mt-4 flex gap-2">
              {socials.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-500 transition hover:border-coral-400 hover:text-coral-500 dark:border-ink-700"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-bold text-ink-900 dark:text-ink-100">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link}>
                    <a href="#" className="text-sm text-ink-500 transition hover:text-coral-500">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact */}
          <div>
            <h4 className="mb-3 text-sm font-bold text-ink-900 dark:text-ink-100">Get in touch</h4>
            <ul className="space-y-2.5 text-sm text-ink-500">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 shrink-0 text-coral-500" />
                <span>
                  742 Marina Boulevard, Suite 200
                  <br />
                  San Francisco, CA 94123, USA
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={15} className="shrink-0 text-coral-500" />
                <a href="tel:+18005551234" className="transition hover:text-coral-500">
                  +1 (800) 555-1234
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={15} className="shrink-0 text-coral-500" />
                <a href="mailto:hello@havyn.app" className="transition hover:text-coral-500">
                  hello@havyn.app
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock size={15} className="shrink-0 text-coral-500" />
                <span>Mon–Sat · 9:00–18:00 PST</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Map */}
        <div className="mt-10">
          <h4 className="mb-3 text-sm font-bold text-ink-900 dark:text-ink-100">Find our office</h4>
          <div className="overflow-hidden rounded-2xl border border-ink-100 dark:border-ink-700">
            <iframe
              title="Havyn headquarters map"
              className="h-56 w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lng}`}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-ink-100 py-5 dark:border-ink-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-xs text-ink-400 sm:flex-row sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} Havyn, Inc. · Crafted for travelers who feel at home anywhere.</span>
          <div className="flex gap-4">
            <a href="#" className="transition hover:text-coral-500">Privacy</a>
            <a href="#" className="transition hover:text-coral-500">Terms</a>
            <a href="#" className="transition hover:text-coral-500">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
