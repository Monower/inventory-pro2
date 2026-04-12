import { Link, usePage } from "@inertiajs/react";
import SidebarDropdown from "@/Components/SidebarDropdown";
import { MdOutlineDashboard } from "react-icons/md";
import { BsShieldLock } from "react-icons/bs";
import { PiGearSixLight } from "react-icons/pi";
import { Package } from "lucide-react";

const Menu = ({ url }) => {
    const { auth, tenant } = usePage().props;
    const permissions = auth.user?.permissions || [];
    const dashboardHref =
        auth.user?.dashboard_route_name === "super-admin.dashboard"
            ? "/super-admin/dashboard"
            : "/dashboard";
    const currentPath =
        url.split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";

    const isPath = (path) => currentPath === path;
    const isPathPrefix = (prefix) =>
        currentPath === prefix || currentPath.startsWith(`${prefix}/`);
    const linkClass = (active) =>
        "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200 " +
        (active
            ? "border-amber-200 bg-amber-50 text-amber-700 shadow-sm dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
            : "border-transparent text-slate-700 hover:border-slate-200 hover:bg-slate-50 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900");
    const subLinkClass = (active) =>
        "menu-sublink block rounded-xl px-3 py-2 text-sm transition-colors duration-200 " +
        (active
            ? "bg-amber-50 font-medium text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
            : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100");

    const dashboardActive =
        isPath("/dashboard") || isPath("/super-admin/dashboard");
    const productsActive = isPathPrefix("/products");
    const settingsActive =
        isPathPrefix("/profile") || isPathPrefix("/settings") || isPathPrefix("/billing");
    const superAdminActive = isPathPrefix("/super-admin");

    return (
        <div className="space-y-2">
            {permissions.includes("view dashboard") && (
                <Link href={dashboardHref} className={linkClass(dashboardActive)}>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800">
                        <MdOutlineDashboard />
                    </span>
                    <span>Dashboard</span>
                </Link>
            )}

            {(permissions.includes("view product") ||
                permissions.includes("view category")) && (
                <SidebarDropdown
                    title="Products"
                    icon={
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800">
                            <Package className="h-4 w-4" />
                        </span>
                    }
                    active={productsActive}
                    defaultOpen={productsActive}
                >
                    <div className="flex flex-col mt-2 space-y-2">
                        {permissions.includes("view product") && (
                            <Link
                                href="/products"
                                className={subLinkClass(isPath("/products"))}
                            >
                                Product list
                            </Link>
                        )}
                        {permissions.includes("view category") && (
                            <Link
                                href="/products/categories"
                                className={subLinkClass(isPathPrefix("/products/categories"))}
                            >
                                Categories
                            </Link>
                        )}
                    </div>
                </SidebarDropdown>
            )}

            {!tenant?.switched && permissions.includes("view tenant") && (
                <Link
                    href="/super-admin/tenants"
                    className={linkClass(superAdminActive)}
                >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800">
                        <BsShieldLock />
                    </span>
                    <span>SaaS Control</span>
                </Link>
            )}

            {!tenant?.switched && permissions.includes("view plan") && (
                <Link
                    href="/super-admin/plans"
                    className={linkClass(isPathPrefix("/super-admin/plans"))}
                >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800">
                        <BsShieldLock />
                    </span>
                    <span>Billing Plans</span>
                </Link>
            )}

            {(permissions.includes("view settings") ||
                permissions.includes("view profile") ||
                permissions.includes("view attribute") ||
                permissions.includes("view unit") ||
                permissions.includes("view billing")) && (
                <SidebarDropdown
                    title="Settings"
                    icon={
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800">
                            <PiGearSixLight />
                        </span>
                    }
                    active={settingsActive}
                    defaultOpen={settingsActive}
                >
                    <div className="flex flex-col mt-2 space-y-2">
                        <Link
                            href="/profile"
                            className={subLinkClass(isPathPrefix("/profile"))}
                        >
                            Profile
                        </Link>
                        <Link
                            href="/settings"
                            className={subLinkClass(isPath("/settings"))}
                        >
                            General settings
                        </Link>
                        {permissions.includes("view attribute") && (
                            <Link
                                href="/settings/attributes"
                                className={subLinkClass(isPathPrefix("/settings/attributes"))}
                            >
                                Attributes
                            </Link>
                        )}
                        {permissions.includes("view unit") && (
                            <Link
                                href="/settings/units"
                                className={subLinkClass(isPathPrefix("/settings/units"))}
                            >
                                Units
                            </Link>
                        )}
                        {permissions.includes("view billing") && (
                            <Link
                                href="/billing"
                                className={subLinkClass(isPathPrefix("/billing"))}
                            >
                                Billing
                            </Link>
                        )}
                    </div>
                </SidebarDropdown>
            )}
        </div>
    );
};

export default Menu;
