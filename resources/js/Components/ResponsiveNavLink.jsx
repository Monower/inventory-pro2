import { Link } from '@inertiajs/react';

export default function ResponsiveNavLink({
    active = false,
    className = '',
    children,
    ...props
}) {
    return (
        <Link
            {...props}
            className={`flex w-full items-start rounded-2xl border px-4 py-3 ${
                active
                    ? 'border-amber-200 bg-amber-50 text-amber-700 focus:border-amber-300 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:border-slate-300 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-slate-100'
            } text-sm font-medium transition duration-150 ease-in-out focus:outline-none ${className}`}
        >
            {children}
        </Link>
    );
}
