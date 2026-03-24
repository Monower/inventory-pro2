import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, useForm, usePage, Head } from "@inertiajs/react";
import Alert from "@/Components/Alert/Alert";
import Sidebar from "./Sidebar";
import Menu from "@/Components/Menu/Menu";
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { applyTheme, resolveTheme } from "@/lib/theme";


export default function AuthenticatedLayout({ header, children, title = "" }) {
    const user = usePage().props.auth.user;
    const {
        settings,
        flash,
        activeBranch,
        accessibleBranches = [],
        license,
    } = usePage().props;
    const { url } = usePage();
    const { data, setData, patch, processing } = useForm({
        branch_id: activeBranch?.id || "",
    });
    const faviconUrl = settings?.favicon_url ?? "/favicon.ico";
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

    useEffect(() => {
        setData("branch_id", activeBranch?.id || "");
    }, [activeBranch?.id]);

    const handleBranchSwitch = (branchId) => {
        setData("branch_id", branchId);
        patch(route("branches.switch"), {
            preserveScroll: true,
            onSuccess: () => setShowingNavigationDropdown(false),
        });
    };

    const planChipClasses = {
        Basic: {
            shell: "border-slate-300 bg-slate-50 text-slate-700 hover:border-slate-400 hover:bg-slate-100",
            dot: "bg-slate-500",
        },
        Advance: {
            shell: "border-sky-300 bg-sky-50 text-sky-700 hover:border-sky-400 hover:bg-sky-100",
            dot: "bg-sky-500",
        },
        Premium: {
            shell: "border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 text-amber-800 shadow-[0_8px_24px_rgba(245,158,11,0.18)] hover:border-amber-400 hover:from-amber-100 hover:via-yellow-50 hover:to-orange-100",
            dot: "bg-gradient-to-r from-amber-500 to-orange-500",
        },
    };
    const activePlanChip =
        planChipClasses[license?.plan_label] || planChipClasses.Basic;

    return (
        <div className="min-h-screen bg-background">
            <Head title={title}>
                <link rel="icon" href={faviconUrl} head-key="app-favicon" />
                <link
                    rel="shortcut icon"
                    href={faviconUrl}
                    head-key="app-shortcut-favicon"
                />
            </Head>
            <nav className="bg-background">
                <div className="mx-auto px-4 sm:px-6 lg:px-8">
                    {license?.requires_activation ? (
                        <div className="mb-3 mt-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="font-semibold">Plan activation required</p>
                                    <p className="text-amber-800">
                                        Protected actions will prompt for activation until a
                                        valid plan key is added from Settings.
                                    </p>
                                </div>
                                <Link
                                    href={route("settings.index")}
                                    className="inline-flex items-center rounded-md border border-amber-400 px-3 py-2 font-medium text-amber-900 transition hover:bg-amber-100"
                                >
                                    Activate Plan
                                </Link>
                            </div>
                        </div>
                    ) : null}

                    {!license?.requires_activation && !license?.is_active ? (
                        <div className="mb-3 mt-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="font-semibold">License needs attention</p>
                                    <p className="text-rose-800">
                                        Current status: {license?.status_label}. Refresh or
                                        reactivate the plan key to continue.
                                    </p>
                                </div>
                                <Link
                                    href={route("settings.index")}
                                    className="inline-flex items-center rounded-md border border-rose-400 px-3 py-2 font-medium text-rose-900 transition hover:bg-rose-100"
                                >
                                    Manage License
                                </Link>
                            </div>
                        </div>
                    ) : null}

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
                            {license?.is_active ? (
                                <Link
                                    href={route("settings.index")}
                                    className={`mr-3 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition ${activePlanChip.shell}`}
                                >
                                    <span className={`h-2 w-2 rounded-full ${activePlanChip.dot}`} />
                                    <span>{license.plan_label}</span>
                                </Link>
                            ) : null}

                            <div className="mr-3">
                                {accessibleBranches.length > 1 ? (
                                    <select
                                        value={data.branch_id}
                                        onChange={(e) => handleBranchSwitch(e.target.value)}
                                        className="rounded-md border border-border bg-background px-3 py-2 text-sm"
                                        disabled={processing}
                                    >
                                        {accessibleBranches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-primary">
                                        {activeBranch?.name || user.branch?.name || "No branch"}
                                    </div>
                                )}
                            </div>
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
                                                className="relative inline-flex items-center rounded-2xl border border-border/70 bg-secondary px-4 py-2.5 text-sm font-medium leading-4 text-primary shadow-sm transition duration-150 ease-in-out hover:border-foreground/15 hover:text-foreground focus:outline-none"
                                            >
                                                <span className="pr-2">{user.name}</span>

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
                            {license?.is_active ? (
                                <div className="px-4">
                                    <Link
                                        href={route("settings.index")}
                                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] ${activePlanChip.shell}`}
                                    >
                                        <span className={`h-2 w-2 rounded-full ${activePlanChip.dot}`} />
                                        <span>{license.plan_label}</span>
                                    </Link>
                                </div>
                            ) : null}

                            <div className="px-4 py-2">
                                {accessibleBranches.length > 1 ? (
                                    <select
                                        value={data.branch_id}
                                        onChange={(e) => handleBranchSwitch(e.target.value)}
                                        className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                                        disabled={processing}
                                    >
                                        {accessibleBranches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="rounded-md border border-border bg-secondary px-3 py-2 text-sm text-primary">
                                        {activeBranch?.name || user.branch?.name || "No branch"}
                                    </div>
                                )}
                            </div>
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
                <main className="w-full min-w-0 p-4 px-4">
                    {(flash?.success || flash?.error) && <Alert flash={flash} />}
                    {children}
                </main>
            </div>
        </div>
    );
}
