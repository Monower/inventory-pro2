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

    return (
        <>
            {permissions.includes("view dashboard") && (
                <Link
                    href="/dashboard"
                    className={
                        url == "/dashboard"
                            ? "flex items-center px-4 py-3 rounded-md text-primary bg-primary-foreground gap-2"
                            : "flex items-center px-4 py-3 rounded-md text-primary gap-2"
                    }
                >
                    <MdOutlineDashboard />
                    <span>Dashboard</span>
                </Link>
            )}

            {permissions.includes("view customer") && (
                <Link
                    href="/customers"
                    className={
                        url.includes("customer")
                            ? "flex items-center px-4 py-3 rounded-md text-primary bg-primary-foreground gap-2"
                            : "flex items-center px-4 py-3 rounded-md text-primary gap-2"
                    }
                >
                    <FaUsers />
                    <span>Customer</span>
                </Link>
            )}

            {(permissions.includes("view staff") ||
                permissions.includes("view staff")) && (
                <SidebarDropdown
                    title="Employee management"
                    icon={<FaUserTie />}
                >
                    <div className="flex flex-col mt-2 space-y-2">
                        {permissions.includes("view staff") && (
                            <Link href="/staffs" className="text-primary">Employees</Link>
                        )}
                        {permissions.includes("view staff") && (
                            <Link href="/salaries" className="text-primary">Salaries</Link>
                        )}
                        {permissions.includes("view staff") && (
                            <Link href="/advance-salaries" className="text-primary">Advance salaries</Link>
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

            {(permissions.includes("view product") ||
                permissions.includes("create product") ||
                permissions.includes("view category") ||
                permissions.includes("view subcategory") ||
                permissions.includes("view attribute") ||
                permissions.includes("view attribute value")) && (
                <SidebarDropdown title="Product" icon={<BsBoxes />}>
                    <div className="flex flex-col mt-2 space-y-2">
                        {permissions.includes("view product") && (
                            <Link href="/products" className="text-primary">Product list</Link>
                        )}
                        {permissions.includes("create product") && (
                            <Link href="/products/create" className="text-primary">Create product</Link>
                        )}
                        {permissions.includes("view category") && (
                            <Link href="/categories" className="text-primary">Category list</Link>
                        )}
                        {permissions.includes("view subcategory") && (
                            <Link href="/sub-categories" className="text-primary">
                                Sub-category list
                            </Link>
                        )}
                        {permissions.includes("view attribute") && (
                            <Link href="/attributes" className="text-primary">Attribute list</Link>
                        )}
                        {/* {permissions.includes("view attribute value") && (
                            <Link href="/attribute-values">
                                Attribute value list
                            </Link>
                        )} */}
                        {permissions.includes("view purchase") && (
                            <Link href="/purchases" className="text-primary">Purchases</Link>
                        )}
                    </div>
                </SidebarDropdown>
            )}

            {(permissions.includes("view role") ||
                permissions.includes("view user")) && (
                <SidebarDropdown
                    title="User management"
                    icon={<BsPersonBoundingBox />}
                >
                    <div className="flex flex-col mt-2 space-y-2">
                        {permissions.includes("view role") && (
                            <Link href="/roles" className="text-primary">User role</Link>
                        )}
                        {permissions.includes("view user") && (
                            <Link href="/users" className="text-primary">User list</Link>
                        )}
                    </div>
                </SidebarDropdown>
            )}

            {permissions.includes("view category") && (
                <SidebarDropdown
                    title="Order"
                    icon={<AiOutlineBorderlessTable />}
                >
                    <div className="flex flex-col mt-2 space-y-2">
                        <Link href="/banks" className="text-primary">Bank list</Link>
                        <Link href="/orders/create" className="text-primary">Create order</Link>
                        <Link href="/orders" className="text-primary">Order list</Link>
                    </div>
                </SidebarDropdown>
            )}

            {permissions.includes("view transaction") && (
                <Link
                    href="/transactions"
                    className={
                        url.includes("transaction")
                            ? "flex items-center px-4 py-3 rounded-md text-primary bg-primary-foreground gap-2"
                            : "flex items-center px-4 py-3 rounded-md text-primary gap-2"
                    }
                >
                    <CiDollar />
                    <span>Transaction tracker</span>
                </Link>
            )}

            {(permissions.includes("view settings") ||
                permissions.includes("view profile")) && (
                <SidebarDropdown title="Settings" icon={<PiGearSixLight />}>
                    <div className="flex flex-col mt-2 space-y-2">
                        <Link href="/profile" className="text-primary">Profile</Link>
                    </div>
                    <div className="flex flex-col mt-2 space-y-2">
                        <Link href="/settings" className="text-primary">General settings</Link>
                    </div>
                </SidebarDropdown>
            )}
        </>
    );
};

export default Menu;
