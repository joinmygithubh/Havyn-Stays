import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../components/ui/Logo.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useAuthStore } from '../store/authStore.js';

/** Account creation page with inline client-side validation. */
export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const signup = useAuthStore((s) => s.signup);
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      await signup(form);
      toast.success('Account created — welcome to Havyn!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Signup failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-8">
        <div className="mb-6 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-4 text-2xl font-extrabold">Create your account</h1>
          <p className="text-sm text-ink-500">Join Havyn and start exploring stays</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-sm font-medium">Full name</span>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input pl-10"
                placeholder="Jane Traveler"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Email</span>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="email"
                required
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input pl-10"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium">Password</span>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
              <input
                type="password"
                required
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input pl-10"
                placeholder="At least 6 characters"
              />
            </div>
          </label>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <Spinner size={18} /> : 'Sign up'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{' '}
          <Link to="/login" state={{ from }} className="font-semibold text-coral-600 hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
