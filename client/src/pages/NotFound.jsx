import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

/** 404 fallback. */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-coral-50 text-coral-500 dark:bg-ink-800">
        <Compass size={40} />
      </div>
      <h1 className="mt-6 text-4xl font-extrabold">Lost your way?</h1>
      <p className="mt-2 text-ink-500">
        We couldn’t find that page. Let’s get you back to discovering beautiful stays.
      </p>
      <Link to="/" className="btn-primary mt-8">
        Back to explore
      </Link>
    </div>
  );
}
