import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import Sidebar from "./Sidebar";
import Menu from "@/Components/Menu/Menu";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { applyTheme, resolveTheme } from "@/lib/theme";


export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { settings } = usePage().props;
    const { url } = usePage();
    // 🌗 Theme state
    const [theme, setTheme] = useState(() => resolveTheme());

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

    return (
        <div className="min-h-screen bg-background">
            <nav className="bg-background">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link
                                    href="/"
                                    className="flex items-center gap-2"
                                >
                                    <ApplicationLogo
                                        logo={
                                            settings.logo_url ??
                                            "/images/demo_image.jpg"
                                        }
                                    />
                                    {/* {
                                        settings.company_name &&
                                        <span className="text-lg font-semibold leading-6 text-gray-900">{settings.company_name}</span>
                                    } */}
                                </Link>
                            </div>

                            {/* <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                >
                                    Dashboard
                                </NavLink>
                            </div> */}
                        </div>

                        <div className="hidden lg:ms-6 lg:flex lg:items-center">
                            {/* 🌙 Theme Toggle Button */}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
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
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-secondary px-3 py-2 text-sm font-medium leading-4 text-primary transition duration-150 ease-in-out hover:text-foreground focus:outline-none"
                                            >
                                                {user.name}

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

                        <div className="-me-2 flex items-center gap-2 lg:hidden">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
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
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition duration-150 ease-in-out hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? "inline-flex"
                                                : "hidden"
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <div
                    className={
                        (showingNavigationDropdown ? "block" : "hidden") +
                        " lg:hidden"
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <Menu url={url} />
                    </div>

                    <div className="border-t border-border pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-foreground">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-muted-foreground">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route("profile.edit")}>
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
            </nav>

            {header && (
                <header className="bg-card shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <div className="flex">
                <Sidebar url={url} />
                <main className="w-full p-4 px-4">{children}</main>
            </div>
        </div>
    );
}
