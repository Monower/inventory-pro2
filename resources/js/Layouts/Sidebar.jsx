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

const Sidebar = ({ url }) => {
    const { auth } = usePage().props;
    const permissions = auth.user?.permissions || [];

    return (
        <div className="bg-white shadow-md flex flex-col min-w-[250px] max-w-[250px] h-screen">
            <div className="flex-1 overflow-y-auto py-4 px-2">
                <div className="space-y-1">
                    {permissions.includes("view dashboard") && (
                        <Link
                            href="/dashboard"
                            className={
                                url == "/dashboard"
                                    ? "flex items-center px-4 py-3 rounded-md text-gray-700 bg-gray-200 gap-2"
                                    : "flex items-center px-4 py-3 rounded-md text-gray-700 gap-2"
                            }
                        >
                            <MdOutlineDashboard />
                            <span className="sidebar-text">Dashboard</span>
                        </Link>
                    )}

                    {permissions.includes("view customer") && (
                        <Link
                            href="/customers"
                            className={
                                url.includes("customer")
                                    ? "flex items-center px-4 py-3 rounded-md text-gray-700 bg-gray-200 gap-2"
                                    : "flex items-center px-4 py-3 rounded-md text-gray-700 gap-2"
                            }
                        >
                            <FaUsers />
                            <span className="sidebar-text">Customer</span>
                        </Link>
                    )}

                    {permissions.includes("view staff") && (
                        <Link
                            href="/staffs"
                            className={
                                url.includes("staff")
                                    ? "flex items-center px-4 py-3 rounded-md text-gray-700 bg-gray-200 gap-2"
                                    : "flex items-center px-4 py-3 rounded-md text-gray-700 gap-2"
                            }
                        >
                            <FaUserTie />
                            <span className="sidebar-text">Staffs</span>
                        </Link>
                    )}

                    {/* {permissions.includes("view product") && (
                        <Link
                            href="/products"
                            className={
                                url.includes("product")
                                    ? "flex items-center px-4 py-3 rounded-md text-gray-700 bg-gray-200"
                                    : "sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                            }
                        >
                            <span className="sidebar-text">Products</span>
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
                                    <Link href="/products">Product list</Link>
                                )}
                                {permissions.includes("create product") && (
                                    <Link href="/products/create">
                                        Create product
                                    </Link>
                                )}
                                {permissions.includes("view category") && (
                                    <Link href="/categories">
                                        Category list
                                    </Link>
                                )}
                                {permissions.includes("view subcategory") && (
                                    <Link href="/sub-categories">
                                        Sub-category list
                                    </Link>
                                )}
                                {permissions.includes("view attribute") && (
                                    <Link href="/attributes">
                                        Attribute list
                                    </Link>
                                )}
                                {permissions.includes(
                                    "view attribute value"
                                ) && (
                                    <Link href="/attribute-values">
                                        Attribute value list
                                    </Link>
                                )}
                            </div>
                        </SidebarDropdown>
                    )}

                    {(permissions.includes("view role") ||
                        permissions.includes("view user")) && (
                        <SidebarDropdown title="User management" icon={<BsPersonBoundingBox />}>
                            <div className="flex flex-col mt-2 space-y-2">
                                {permissions.includes("view role") && (
                                    <Link href="/roles">User role</Link>
                                )}
                                {permissions.includes("view user") && (
                                    <Link href="/users">User list</Link>
                                )}
                            </div>
                        </SidebarDropdown>
                    )}

                    {permissions.includes("view category") && (
                        <SidebarDropdown title="Order" icon={<AiOutlineBorderlessTable />}>
                            <div className="flex flex-col mt-2 space-y-2">
                                <Link href="/banks">Bank list</Link>
                                <Link href="/orders/create">Create order</Link>
                                <Link href="/orders">Order list</Link>
                            </div>
                        </SidebarDropdown>
                    )}

                    {permissions.includes("view transaction") && (
                        <Link
                            href="/transactions"
                            className={
                                url.includes("transaction")
                                    ? "flex items-center px-4 py-3 rounded-md text-gray-700 bg-gray-200 gap-2"
                                    : "flex items-center px-4 py-3 rounded-md text-gray-700 gap-2"
                            }
                        >
                            <CiDollar />
                            <span className="sidebar-text">
                                Transaction tracker
                            </span>
                        </Link>
                    )}


                    {/* {permissions.includes("view category") && ( */}
                        <SidebarDropdown title="Settings" icon={<PiGearSixLight />}>
                            <div className="flex flex-col mt-2 space-y-2">
                                <Link href="/profile">Profile</Link>
                            </div>
                        </SidebarDropdown>
                    {/* )} */}



                    {/* {permissions.includes("view category") && (
                        <SidebarDropdown title="Categories">
                            <div className="flex flex-col mt-2 space-y-2">
                                <Link href="/categories">List</Link>
                                <Link href="/categories/create">Create</Link>
                            </div>
                        </SidebarDropdown>
                    )}

                    {permissions.includes("view subcategory") && (
                        <SidebarDropdown title="Sub Categories">
                            <div className="flex flex-col mt-2 space-y-2">
                                <Link href="/sub-categories">List</Link>
                                <Link href="/sub-categories/create">
                                    Create
                                </Link>
                            </div>
                        </SidebarDropdown>
                    )} */}

                    
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
