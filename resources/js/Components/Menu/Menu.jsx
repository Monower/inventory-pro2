import { Link, usePage } from "@inertiajs/react";
import SidebarDropdown from "@/Components/SidebarDropdown";
import { MdOutlineDashboard } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa6";
import { BsBoxes } from "react-icons/bs";
import { BsPersonBoundingBox } from "react-icons/bs";
import { AiOutlineBorderlessTable } from "react-icons/ai";
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
        "flex items-center px-4 py-3 rounded-md gap-2 border transition-colors duration-200 " +
        (active
            ? "text-violet-600 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/40 border-violet-200 dark:border-violet-700/60"
            : "text-primary border-transparent hover:bg-muted");
    const subLinkClass = (active) =>
        "menu-sublink block rounded-md px-2 py-1.5 transition-colors duration-200 " +
        (active
            ? "text-violet-600 dark:text-violet-300 bg-violet-100 dark:bg-violet-900/40 font-medium"
            : "text-muted-foreground hover:text-foreground hover:bg-muted");

    const dashboardActive = isPath("/dashboard");
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
        isPathPrefix("/profile") || isPathPrefix("/settings");

    return (
        <>
            {permissions.includes("view dashboard") && (
                <Link href="/dashboard" className={linkClass(dashboardActive)}>
                    <MdOutlineDashboard />
                    <span>Dashboard</span>
                </Link>
            )}

            {permissions.includes("view order") && (
                <SidebarDropdown
                    title="Order"
                    icon={<AiOutlineBorderlessTable />}
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
                    icon={<BsBoxes />}
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
                    <FaUsers />
                    <span>Customer</span>
                </Link>
            )}

            {(permissions.includes("view staff") ||
                permissions.includes("view staff")) && (
                <SidebarDropdown
                    title="Employee management"
                    icon={<FaUserTie />}
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
                    icon={<BsPersonBoundingBox />}
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

            {permissions.includes("view transaction") && (
                <Link href="/transactions" className={linkClass(transactionActive)}>
                    <CiDollar />
                    <span>Transaction tracker</span>
                </Link>
            )}

            {(permissions.includes("view settings") ||
                permissions.includes("view profile")) && (
                <SidebarDropdown
                    title="Settings"
                    icon={<PiGearSixLight />}
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
        </>
    );
};

export default Menu;
