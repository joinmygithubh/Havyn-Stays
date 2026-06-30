import { SearchX } from 'lucide-react';

/** Friendly empty state with an icon, headline and optional action slot. */
export default function EmptyState({
  icon: Icon = SearchX,
  title = 'Nothing here yet',
  message = '',
  action = null,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-20 text-center ${className}`}>
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-coral-50 text-coral-500 dark:bg-ink-800">
        <Icon size={30} />
      </div>
      <h3 className="text-lg font-bold text-ink-900 dark:text-ink-100">{title}</h3>
      {message && <p className="mt-1 max-w-sm text-sm text-ink-500">{message}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
