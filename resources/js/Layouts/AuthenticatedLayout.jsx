import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage, Head } from "@inertiajs/react";
import Alert from "@/Components/Alert/Alert";
import Sidebar from "./Sidebar";
import Menu from "@/Components/Menu/Menu";
import { useState, useEffect } from "react";
import { Sun, Moon, Menu as MenuIcon, X } from "lucide-react";
import { applyTheme, resolveTheme } from "@/lib/theme";


export default function AuthenticatedLayout({ header, children, title = "" }) {
    const user = usePage().props.auth.user;
    const { settings, company_name, flash } = usePage().props;
    const { url } = usePage();
    // 🌗 Theme state
    const [theme, setTheme] = useState(() => resolveTheme());
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    // Toggle handler
    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    // Apply theme to <html>
    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    useEffect(() => {
        document.body.classList.toggle("overflow-hidden", showingNavigationDropdown);

        return () => document.body.classList.remove("overflow-hidden");
    }, [showingNavigationDropdown]);

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
            <Head title={title + " - " + company_name} />
            <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex h-20 items-center justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setShowingNavigationDropdown(true)
                                }
                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                title="Open navigation"
                            >
                                <MenuIcon size={20} />
                            </button>
                            <Link
                                href="/"
                                className="flex min-w-0 items-center gap-3"
                            >
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                                    <ApplicationLogo
                                        logo={
                                            settings.logo_url ??
                                            "/images/demo_image.jpg"
                                        }
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                                        Inventory Pro
                                    </p>
                                    <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                                        {company_name}
                                    </p>
                                </div>
                            </Link>
                        </div>

                        <div className="flex items-center gap-2 lg:gap-3">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                title="Toggle Theme"
                            >
                                {theme === "light" ? (
                                    <Moon
                                        className="text-foreground"
                                        size={20}
                                    />
                                ) : (
                                    <Sun
                                        className="text-foreground"
                                        size={20}
                                    />
                                )}
                            </button>
                            <div className="hidden lg:block">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium leading-4 text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                                            >
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold uppercase text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                                    {user.name?.charAt(0)}
                                                </div>
                                                <div className="text-left">
                                                    <p className="max-w-32 truncate font-semibold">
                                                        {user.name}
                                                    </p>
                                                    <p className="max-w-32 truncate text-xs text-slate-500 dark:text-slate-400">
                                                        {user.email}
                                                    </p>
                                                </div>

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route("profile.edit")}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route("logout")}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-card shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <div className="flex min-h-[calc(100vh-5rem)]">
                <Sidebar
                    url={url}
                    collapsed={sidebarCollapsed}
                    onToggle={() =>
                        setSidebarCollapsed((previousState) => !previousState)
                    }
                />
                <main className="w-full min-w-0 p-4 sm:p-6">
                    {(flash?.success || flash?.error) && <Alert flash={flash} />}
                    {children}
                </main>
            </div>

            <div
                className={`fixed inset-0 z-50 lg:hidden ${
                    showingNavigationDropdown ? "pointer-events-auto" : "pointer-events-none"
                }`}
            >
                <div
                    onClick={() => setShowingNavigationDropdown(false)}
                    className={`absolute inset-0 bg-slate-950/50 backdrop-blur-sm transition-opacity ${
                        showingNavigationDropdown ? "opacity-100" : "opacity-0"
                    }`}
                />
                <div
                    className={`absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col border-r border-slate-200 bg-white shadow-2xl transition-transform dark:border-slate-800 dark:bg-slate-950 ${
                        showingNavigationDropdown ? "translate-x-0" : "-translate-x-full"
                    }`}
                >
                    <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800">
                        <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900">
                                <ApplicationLogo
                                    logo={
                                        settings.logo_url ??
                                        "/images/demo_image.jpg"
                                    }
                                />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {company_name}
                                </p>
                                <p className="truncate text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                    Navigation
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowingNavigationDropdown(false)}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        <Menu url={url} />
                    </div>

                    <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                        <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900">
                            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
                                {user.name}
                            </p>
                            <p className="truncate text-sm text-slate-500 dark:text-slate-400">
                                {user.email}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <ResponsiveNavLink
                                href={route("profile.edit")}
                                active={url.startsWith("/profile")}
                                onClick={() => setShowingNavigationDropdown(false)}
                            >
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route("logout")}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
