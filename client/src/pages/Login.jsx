import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import Logo from '../components/ui/Logo.jsx';
import Spinner from '../components/ui/Spinner.jsx';
import { useAuthStore } from '../store/authStore.js';

/** Login page. Redirects back to the page the user came from on success. */
export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const from = location.state?.from || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (role) => {
    setForm(
      role === 'host'
        ? { email: 'aria@havyn.dev', password: 'password123' }
        : { email: 'sam@havyn.dev', password: 'password123' }
    );
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-8"
      >
        <div className="mb-6 text-center">
          <Logo className="justify-center" />
          <h1 className="mt-4 text-2xl font-extrabold">Welcome back</h1>
          <p className="text-sm text-ink-500">Log in to continue your journey</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
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
                autoComplete="current-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input pl-10"
                placeholder="••••••••"
              />
            </div>
          </label>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? <Spinner size={18} /> : 'Log in'}
          </button>
        </form>

        <div className="mt-4 rounded-xl bg-ink-50 p-3 text-center text-xs text-ink-500 dark:bg-ink-900">
          Try a demo account:{' '}
          <button onClick={() => fillDemo('guest')} className="font-semibold text-coral-600 underline">
            Guest
          </button>{' '}
          ·{' '}
          <button onClick={() => fillDemo('host')} className="font-semibold text-coral-600 underline">
            Host
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-ink-500">
          New to Havyn?{' '}
          <Link to="/signup" state={{ from }} className="font-semibold text-coral-600 hover:underline">
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
