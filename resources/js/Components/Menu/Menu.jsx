import { Link, usePage } from "@inertiajs/react";
import SidebarDropdown from "@/Components/SidebarDropdown";
import { MdOutlineDashboard } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa6";
import { BsBoxes } from "react-icons/bs";
import { BsPersonBoundingBox } from "react-icons/bs";
import { BsShieldLock } from "react-icons/bs";
import { AiOutlineBorderlessTable } from "react-icons/ai";
import { CiDollar } from "react-icons/ci";
import { PiGearSixLight } from "react-icons/pi";

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
    const orderActive = isPathPrefix("/orders") || isPathPrefix("/banks");
    const productActive =
        isPathPrefix("/products") ||
        isPathPrefix("/categories") ||
        isPathPrefix("/sub-categories") ||
        isPathPrefix("/attributes") ||
        isPathPrefix("/attribute-values") ||
        isPathPrefix("/purchases");
    const customerActive = isPathPrefix("/customers");
    const employeeActive =
        isPathPrefix("/staffs") ||
        isPathPrefix("/salaries") ||
        isPathPrefix("/advance-salaries");
    const userManagementActive =
        isPathPrefix("/roles") || isPathPrefix("/users");
    const transactionActive = isPathPrefix("/transactions");
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

            {permissions.includes("view order") && (
                <SidebarDropdown
                    title="Order"
                    icon={
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800">
                            <AiOutlineBorderlessTable />
                        </span>
                    }
                    active={orderActive}
                    defaultOpen={orderActive}
                >
                    <div className="flex flex-col mt-2 space-y-2">
                        <Link
                            href="/orders/create"
                            className={subLinkClass(isPath("/orders/create"))}
                        >
                            Create order
                        </Link>
                        <Link
                            href="/orders"
                            className={subLinkClass(isPath("/orders"))}
                        >
                            Order list
                        </Link>
                        <Link
                            href="/banks"
                            className={subLinkClass(isPathPrefix("/banks"))}
                        >
                            Bank list
                        </Link>
                    </div>
                </SidebarDropdown>
            )}

            {(permissions.includes("view product") ||
                permissions.includes("create product") ||
                permissions.includes("view category") ||
                permissions.includes("view subcategory") ||
                permissions.includes("view attribute") ||
                permissions.includes("view attribute value")) && (
                <SidebarDropdown
                    title="Product"
                    icon={
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800">
                            <BsBoxes />
                        </span>
                    }
                    active={productActive}
                    defaultOpen={productActive}
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
                        {permissions.includes("create product") && (
                            <Link
                                href="/products/create"
                                className={subLinkClass(
                                    isPath("/products/create")
                                )}
                            >
                                Create product
                            </Link>
                        )}
                        {permissions.includes("view category") && (
                            <Link
                                href="/categories"
                                className={subLinkClass(isPathPrefix("/categories"))}
                            >
                                Category list
                            </Link>
                        )}
                        {permissions.includes("view subcategory") && (
                            <Link
                                href="/sub-categories"
                                className={subLinkClass(
                                    isPathPrefix("/sub-categories")
                                )}
                            >
                                Sub-category list
                            </Link>
                        )}
                        {permissions.includes("view attribute") && (
                            <Link
                                href="/attributes"
                                className={subLinkClass(isPathPrefix("/attributes"))}
                            >
                                Attribute list
                            </Link>
                        )}
                        {/* {permissions.includes("view attribute value") && (
                            <Link href="/attribute-values">
                                Attribute value list
                            </Link>
                        )} */}
                        {permissions.includes("view purchase") && (
                            <Link
                                href="/purchases"
                                className={subLinkClass(isPathPrefix("/purchases"))}
                            >
                                Purchases
                            </Link>
                        )}
                    </div>
                </SidebarDropdown>
            )}

            {permissions.includes("view customer") && (
                <Link href="/customers" className={linkClass(customerActive)}>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800">
                        <FaUsers />
                    </span>
                    <span>Customer</span>
                </Link>
            )}

            {(permissions.includes("view staff") ||
                permissions.includes("view staff")) && (
                <SidebarDropdown
                    title="Employee management"
                    icon={
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800">
                            <FaUserTie />
                        </span>
                    }
                    active={employeeActive}
                    defaultOpen={employeeActive}
                >
                    <div className="flex flex-col mt-2 space-y-2">
                        {permissions.includes("view staff") && (
                            <Link
                                href="/staffs"
                                className={subLinkClass(isPathPrefix("/staffs"))}
                            >
                                Employees
                            </Link>
                        )}
                        {permissions.includes("view staff") && (
                            <Link
                                href="/salaries"
                                className={subLinkClass(isPathPrefix("/salaries"))}
                            >
                                Salaries
                            </Link>
                        )}
                        {permissions.includes("view staff") && (
                            <Link
                                href="/advance-salaries"
                                className={subLinkClass(
                                    isPathPrefix("/advance-salaries")
                                )}
                            >
                                Advance salaries
                            </Link>
                        )}
                    </div>
                </SidebarDropdown>
            )}

            {/* {permissions.includes("view staff") && (
                <Link
                    href="/staffs"
                    className={
                        url.includes("staff")
                            ? "flex items-center px-4 py-3 rounded-md text-primary bg-primary-foreground gap-2"
                            : "flex items-center px-4 py-3 rounded-md text-primary gap-2"
                    }
                >
                    <FaUserTie />
                    <span>Staffs</span>
                </Link>
            )} */}

            

            {(permissions.includes("view role") ||
                permissions.includes("view user")) && (
                <SidebarDropdown
                    title="User management"
                    icon={
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800">
                            <BsPersonBoundingBox />
                        </span>
                    }
                    active={userManagementActive}
                    defaultOpen={userManagementActive}
                >
                    <div className="flex flex-col mt-2 space-y-2">
                        {permissions.includes("view role") && (
                            <Link
                                href="/roles"
                                className={subLinkClass(isPathPrefix("/roles"))}
                            >
                                User role
                            </Link>
                        )}
                        {permissions.includes("view user") && (
                            <Link
                                href="/users"
                                className={subLinkClass(isPathPrefix("/users"))}
                            >
                                User list
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

            {permissions.includes("view transaction") && (
                <Link href="/transactions" className={linkClass(transactionActive)}>
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800">
                        <CiDollar />
                    </span>
                    <span>Transaction tracker</span>
                </Link>
            )}

            {(permissions.includes("view settings") ||
                permissions.includes("view profile")) && (
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
                            className={subLinkClass(isPathPrefix("/settings"))}
                        >
                            General settings
                        </Link>
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
