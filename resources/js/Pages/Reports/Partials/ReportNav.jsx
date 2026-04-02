import { Link, usePage } from "@inertiajs/react";

const links = [
    { label: "Overview", href: "/reports", match: "/reports" },
    { label: "Orders", href: "/reports/orders", match: "/reports/orders" },
    {
        label: "Purchases",
        href: "/reports/purchases",
        match: "/reports/purchases",
    },
    {
        label: "Salaries",
        href: "/reports/salaries",
        match: "/reports/salaries",
    },
    {
        label: "Profit & Loss",
        href: "/reports/profit-loss",
        match: "/reports/profit-loss",
    },
];

const ReportNav = () => {
    const { url } = usePage();

    return (
        <div className="flex flex-wrap gap-2">
            {links.map((link) => {
                const active = url === link.match || url.startsWith(`${link.match}?`);

                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                            active
                                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                                : "bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:ring-slate-700 dark:hover:text-slate-100"
                        }`}
                    >
                        {link.label}
                    </Link>
                );
            })}
        </div>
    );
};

export default ReportNav;
