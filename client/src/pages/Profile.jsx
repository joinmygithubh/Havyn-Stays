import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Heart, LayoutDashboard, BadgeCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

import Spinner from '../components/ui/Spinner.jsx';
import { useAuthStore } from '../store/authStore.js';

/** Profile page: edit details, quick links, and the become-a-host flow. */
export default function Profile() {
  const { user, updateProfile, becomeHost } = useAuthStore();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });
  const [saving, setSaving] = useState(false);
  const [hosting, setHosting] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  const handleBecomeHost = async () => {
    setHosting(true);
    try {
      await becomeHost();
      toast.success('You’re now a host! 🎉');
    } catch (err) {
      toast.error(err.message || 'Could not enable hosting');
    } finally {
      setHosting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <img src={user?.avatar} alt={user?.name} className="h-20 w-20 rounded-full object-cover ring-2 ring-coral-100" />
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold">
            {user?.name}
            {user?.isSuperhost && <BadgeCheck size={20} className="text-coral-500" />}
          </h1>
          <p className="text-ink-500">{user?.email}</p>
          {user?.isHost && (
            <span className="mt-1 inline-block rounded-full bg-coral-50 px-2.5 py-0.5 text-xs font-semibold text-coral-600 dark:bg-ink-800">
              Host
            </span>
          )}
        </div>
      </div>

      {/* Quick links */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <QuickLink to="/trips" icon={Briefcase} label="My trips" />
        <QuickLink to="/wishlist" icon={Heart} label="Wishlist" />
        {user?.isHost && <QuickLink to="/host" icon={LayoutDashboard} label="Host dashboard" />}
      </div>

      {/* Become a host */}
      {!user?.isHost && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-r from-coral-500 to-coral-600 p-8 text-white"
        >
          <div className="flex items-center gap-2 text-sm font-semibold opacity-90">
            <Sparkles size={16} /> Earn with Havyn
          </div>
          <h2 className="mt-2 text-2xl font-extrabold">Become a host</h2>
          <p className="mt-1 max-w-md opacity-90">
            Share your space, meet travelers from around the world, and earn extra income. Listing takes just minutes.
          </p>
          <button
            onClick={handleBecomeHost}
            disabled={hosting}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-coral-600 transition hover:bg-coral-50 disabled:opacity-70"
          >
            {hosting ? <Spinner size={18} /> : 'Start hosting'}
          </button>
        </motion.div>
      )}

      {/* Edit profile */}
      <form onSubmit={save} className="card mt-8 p-6">
        <h2 className="text-lg font-bold">Profile details</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Name</span>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Phone</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input" placeholder="Optional" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-medium">Avatar URL</span>
            <input value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} className="input" placeholder="https://…" />
          </label>
          <label className="block sm:col-span-2">
            <span className="mb-1 block text-sm font-medium">Bio</span>
            <textarea
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              rows={3}
              maxLength={500}
              className="input resize-none"
              placeholder="Tell guests a little about yourself"
            />
          </label>
        </div>
        <button type="submit" disabled={saving} className="btn-primary mt-5">
          {saving ? <Spinner size={18} /> : 'Save changes'}
        </button>
      </form>
    </div>
  );
}

function QuickLink({ to, icon: Icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 font-medium shadow-card transition hover:shadow-card-hover dark:border-ink-700 dark:bg-ink-800"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-coral-50 text-coral-500 dark:bg-ink-900">
        <Icon size={18} />
      </span>
      {label}
    </Link>
  );
}
