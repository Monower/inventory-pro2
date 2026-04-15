import { Link, usePage } from "@inertiajs/react";
import SidebarDropdown from "@/Components/SidebarDropdown";
import { MdOutlineDashboard } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa6";
import { BsBoxes } from "react-icons/bs";
import { BsPersonBoundingBox } from "react-icons/bs";
import { AiOutlineBorderlessTable } from "react-icons/ai";
import { AiOutlineBarChart } from "react-icons/ai";
import { CiDollar } from "react-icons/ci";
import { PiGearSixLight } from "react-icons/pi";

const Menu = ({ url }) => {
    const { auth } = usePage().props;
    const permissions = auth.user?.permissions || [];
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

    const dashboardActive = isPath("/dashboard");
    const orderActive = isPathPrefix("/orders");
    const productActive =
        isPathPrefix("/products") ||
        isPathPrefix("/product-prices") ||
        isPathPrefix("/categories") ||
        isPathPrefix("/sub-categories") ||
        isPathPrefix("/attributes") ||
        isPathPrefix("/attribute-values");
    const customerActive = isPathPrefix("/customers");
    const employeeActive = isPathPrefix("/staffs");
    const userManagementActive =
        isPathPrefix("/roles") || isPathPrefix("/users");
    const financeActive =
        isPathPrefix("/banks") ||
        isPathPrefix("/purchases") ||
        isPathPrefix("/salaries") ||
        isPathPrefix("/advance-salaries") ||
        isPathPrefix("/transactions") ||
        isPathPrefix("/transaction");
    const reportActive = isPathPrefix("/reports");
    const settingsActive =
        isPathPrefix("/profile") || isPathPrefix("/settings");

    return (
        <div className="space-y-2">
            {permissions.includes("view dashboard") && (
                <Link href="/dashboard" className={linkClass(dashboardActive)}>
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
                        {permissions.includes("view product") && (
                            <Link
                                href="/product-prices"
                                className={subLinkClass(
                                    isPathPrefix("/product-prices")
                                )}
                            >
                                Product prices
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

            {(permissions.includes("view bank") ||
                permissions.includes("view purchase") ||
                permissions.includes("view salary") ||
                permissions.includes("view advance salary") ||
                permissions.includes("view transaction")) && (
                <SidebarDropdown
                    title="Finances"
                    icon={
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800">
                            <CiDollar />
                        </span>
                    }
                    active={financeActive}
                    defaultOpen={financeActive}
                >
                    <div className="flex flex-col mt-2 space-y-2">
                        {permissions.includes("view bank") && (
                            <Link
                                href="/banks"
                                className={subLinkClass(isPathPrefix("/banks"))}
                            >
                                Bank list
                            </Link>
                        )}
                        {permissions.includes("view purchase") && (
                            <Link
                                href="/purchases"
                                className={subLinkClass(isPathPrefix("/purchases"))}
                            >
                                Purchases
                            </Link>
                        )}
                        {permissions.includes("view salary") && (
                            <Link
                                href="/salaries"
                                className={subLinkClass(isPathPrefix("/salaries"))}
                            >
                                Salaries
                            </Link>
                        )}
                        {permissions.includes("view advance salary") && (
                            <Link
                                href="/advance-salaries"
                                className={subLinkClass(
                                    isPathPrefix("/advance-salaries")
                                )}
                            >
                                Advance salaries
                            </Link>
                        )}
                        {permissions.includes("view transaction") && (
                            <Link
                                href="/transactions"
                                className={subLinkClass(
                                    isPathPrefix("/transactions") ||
                                        isPathPrefix("/transaction")
                                )}
                            >
                                Transaction tracker
                            </Link>
                        )}
                    </div>
                </SidebarDropdown>
            )}

            {permissions.includes("view report") && (
                <SidebarDropdown
                    title="Reports"
                    icon={
                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-base dark:bg-slate-800">
                            <AiOutlineBarChart />
                        </span>
                    }
                    active={reportActive}
                    defaultOpen={reportActive}
                >
                    <div className="mt-2 flex flex-col space-y-2">
                        <Link
                            href="/reports"
                            className={subLinkClass(isPath("/reports"))}
                        >
                            Overview
                        </Link>
                        <Link
                            href="/reports/orders"
                            className={subLinkClass(isPathPrefix("/reports/orders"))}
                        >
                            Orders report
                        </Link>
                        <Link
                            href="/reports/purchases"
                            className={subLinkClass(
                                isPathPrefix("/reports/purchases")
                            )}
                        >
                            Purchase report
                        </Link>
                        <Link
                            href="/reports/salaries"
                            className={subLinkClass(
                                isPathPrefix("/reports/salaries")
                            )}
                        >
                            Salary report
                        </Link>
                        <Link
                            href="/reports/profit-loss"
                            className={subLinkClass(
                                isPathPrefix("/reports/profit-loss")
                            )}
                        >
                            Profit & loss
                        </Link>
                    </div>
                </SidebarDropdown>
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
                    </div>
                </SidebarDropdown>
            )}
        </div>
    );
};

export default Menu;
