import { Link } from "@inertiajs/react";
import SidebarDropdown from "@/Components/SidebarDropdown";

const Sidebar = ({url}) => {
    return (
        <div className="sidebar bg-white shadow-md flex flex-col">

            <div className="flex-1 overflow-y-auto py-4 px-2">
                <div className="space-y-1">
                    <Link
                        href="/dashboard"
                        className={ url == '/dashboard' ? 'flex items-center px-4 py-3 rounded-md text-gray-700 bg-gray-200' : 'sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700'}
                    >
                        <span className="sidebar-text">Dashboard</span>
                    </Link>
                    <Link
                        href="/products"
                        className={  url.includes('product') ? 'flex items-center px-4 py-3 rounded-md text-gray-700 bg-gray-200' : 'sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700'}
                    >
                        <span className="sidebar-text">Products</span>
                    </Link>
                    <Link
                        href="/customers"
                        className={  url.includes('customer') ? 'flex items-center px-4 py-3 rounded-md text-gray-700 bg-gray-200' : 'sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700'}
                    >
                        <span className="sidebar-text">Customer</span>
                    </Link>
                    <Link
                        href="/staffs"
                        className={  url.includes('staff') ? 'flex items-center px-4 py-3 rounded-md text-gray-700 bg-gray-200' : 'sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700'}
                    >
                        <span className="sidebar-text">Staffs</span>
                    </Link>
                    <SidebarDropdown
                        title="Categories"
                        // iconClass="fas fa-tachometer-alt text-gray-500 w-6 mr-3"
                    >
                        <div className="flex flex-col mt-2 space-y-2">
                            <Link href="/categories">List</Link>
                            <Link href="/categories/create">Create</Link>
                        </div>
                    </SidebarDropdown>
                    <SidebarDropdown
                        title="Sub Categories"
                        // iconClass="fas fa-tachometer-alt text-gray-500 w-6 mr-3"
                    >
                        <div className="flex flex-col mt-2 space-y-2">
                            <Link href="/sub-categories">List</Link>
                            <Link href="/sub-categories/create">Create</Link>
                        </div>
                    </SidebarDropdown>
                    <SidebarDropdown
                        title="User management"
                        // iconClass="fas fa-tachometer-alt text-gray-500 w-6 mr-3"
                    >
                        <div className="flex flex-col mt-2 space-y-2">
                            <Link href="/sub-categories">User role</Link>
                            <Link href="/sub-categories/create">User list</Link>
                        </div>
                    </SidebarDropdown>

                    <Link
                        href="/transactions"
                        className={  url.includes('transaction') ? 'flex items-center px-4 py-3 rounded-md text-gray-700 bg-gray-200' : 'sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700'}
                    >
                        <span className="sidebar-text">Transaction tracker</span>
                    </Link>


                    {/* <Link href="#" className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700" onClick="showPage('categories', this)">
                        <i className="fas fa-tags text-gray-500 w-6 mr-3"></i>
                        <span className="sidebar-text">Categories</span>
                    </Link> */}
                    {/* <a
                        href="#"
                        className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                    >
                        <i className="fas fa-truck text-gray-500 w-6 mr-3"></i>
                        <span className="sidebar-text">Suppliers</span>
                    </a>
                    <a
                        href="#"
                        className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                    >
                        <i className="fas fa-shopping-cart text-gray-500 w-6 mr-3"></i>
                        <span className="sidebar-text">Purchases</span>
                    </a>
                    <a
                        href="#"
                        className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                    >
                        <i className="fas fa-cash-register text-gray-500 w-6 mr-3"></i>
                        <span className="sidebar-text">Sales</span>
                    </a>
                    <a
                        href="#"
                        className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                    >
                        <i className="fas fa-warehouse text-gray-500 w-6 mr-3"></i>
                        <span className="sidebar-text">Inventory</span>
                    </a>
                    <a
                        href="#"
                        className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                    >
                        <i className="fas fa-chart-bar text-gray-500 w-6 mr-3"></i>
                        <span className="sidebar-text">Reports</span>
                    </a> */}

                    {/* <div id="admin-links">
                        <div className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Administration
                        </div>
                        <a
                            href="#"
                            className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                        >
                            <i className="fas fa-users-cog text-gray-500 w-6 mr-3"></i>
                            <span className="sidebar-text">
                                User Management
                            </span>
                        </a>
                        <a
                            href="#"
                            className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                        >
                            <i className="fas fa-cog text-gray-500 w-6 mr-3"></i>
                            <span className="sidebar-text">Settings</span>
                        </a>
                    </div> */}
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
