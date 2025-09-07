import { Link, usePage } from "@inertiajs/react";
import SidebarDropdown from "@/Components/SidebarDropdown";

const Sidebar = ({ url }) => {
    const { auth } = usePage().props;
    const permissions = auth.user?.permissions || [];

    console.log("permissions: ", permissions);

    return (
        <div className="sidebar bg-white shadow-md flex flex-col">
            <div className="flex-1 overflow-y-auto py-4 px-2">
                <div className="space-y-1">
                    {permissions.includes("view dashboard") && (
                        <Link
                            href="/dashboard"
                            className={
                                url == "/dashboard"
                                    ? "flex items-center px-4 py-3 rounded-md text-gray-700 bg-gray-200"
                                    : "sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                            }
                        >
                            <span className="sidebar-text">Dashboard</span>
                        </Link>
                    )}

                    {permissions.includes("view product") && (
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
                    )}

                    {permissions.includes("view customer") && (
                        <Link
                            href="/customers"
                            className={
                                url.includes("customer")
                                    ? "flex items-center px-4 py-3 rounded-md text-gray-700 bg-gray-200"
                                    : "sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                            }
                        >
                            <span className="sidebar-text">Customer</span>
                        </Link>
                    )}

                    {permissions.includes("view staff") && (
                        <Link
                            href="/staffs"
                            className={
                                url.includes("staff")
                                    ? "flex items-center px-4 py-3 rounded-md text-gray-700 bg-gray-200"
                                    : "sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                            }
                        >
                            <span className="sidebar-text">Staffs</span>
                        </Link>
                    )}

                    {permissions.includes("view category") && (
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
                    )}

                    {(permissions.includes("view role") ||
                        permissions.includes("view user")) && (
                        <SidebarDropdown title="User management">
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

                    {permissions.includes("view transaction") && (
                        <Link
                            href="/transactions"
                            className={
                                url.includes("transaction")
                                    ? "flex items-center px-4 py-3 rounded-md text-gray-700 bg-gray-200"
                                    : "sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                            }
                        >
                            <span className="sidebar-text">
                                Transaction tracker
                            </span>
                        </Link>
                    )}
                </div>
            </div>

            {/* <div className="p-4 border-t border-gray-200">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <img id="user-avatar" className="h-10 w-10 rounded-full" src="https://ui-avatars.com/api/?name=User&background=4f46e5&color=fff" alt="User" />
                    </div>
                    <div className="ml-3 sidebar-text">
                        <p id="user-name" className="text-sm font-medium text-gray-700">User Name</p>
                        <p id="user-role" className="text-xs text-gray-500">Administrator</p>
                    </div>
                    <button onClick="logout()" className="ml-auto text-gray-400 hover:text-gray-500">
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div> */}
        </div>
    );
};

export default Sidebar;
