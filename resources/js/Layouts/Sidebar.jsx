import { Link } from "@inertiajs/react";
import SidebarDropdown from "@/Components/SidebarDropdown";

const Sidebar = () => {
    return (
        <div className="sidebar bg-white shadow-md flex flex-col">
            {/* <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center">
                    <div className="bg-indigo-600 text-white p-2 rounded-lg mr-3">
                        <i className="fas fa-boxes text-xl"></i>
                    </div>
                    <span className="logo-text text-xl font-bold text-gray-800">InventoryPro</span>
                </div>
                <button id="sidebar-toggle" className="text-gray-500 hover:text-gray-700 focus:outline-none">
                    <i className="fas fa-chevron-left"></i>
                </button>
            </div> */}

            <div className="flex-1 overflow-y-auto py-4 px-2">
                <div className="space-y-1">
                    {/* <Link href="/" className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700">
                        Home
                    </Link> */}
                    <Link
                        href="/dashboard"
                        className="sidebar-link active flex items-center px-4 py-3 rounded-md text-gray-700"
                        onclick="showPage('dashboard', this)"
                    >
                        <i className="fas fa-tachometer-alt text-gray-500 w-6 mr-3"></i>
                        <span className="sidebar-text">Dashboard</span>
                    </Link>
                    <Link
                        href="/products"
                        className="sidebar-link active flex items-center px-4 py-3 rounded-md text-gray-700"
                        onclick="showPage('dashboard', this)"
                    >
                        <i className="fas fa-tachometer-alt text-gray-500 w-6 mr-3"></i>
                        <span className="sidebar-text">Products</span>
                    </Link>
                    <SidebarDropdown
                        title="Categories"
                        iconClass="fas fa-tachometer-alt text-gray-500 w-6 mr-3"
                    >
                        <div className="flex flex-col ml-10 mt-2 space-y-2">
                            <Link href="/categories">List</Link>
                            <Link href="/categories/create">Create</Link>
                        </div>
                        {/* <Link>
                            Create
                        </Link> */}
                    </SidebarDropdown>
                    {/* <Link href="#" className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700" onclick="showPage('categories', this)">
                        <i className="fas fa-tags text-gray-500 w-6 mr-3"></i>
                        <span className="sidebar-text">Categories</span>
                    </Link> */}
                    <a
                        href="#"
                        className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                        onclick="showPage('suppliers', this)"
                    >
                        <i className="fas fa-truck text-gray-500 w-6 mr-3"></i>
                        <span className="sidebar-text">Suppliers</span>
                    </a>
                    <a
                        href="#"
                        className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                        onclick="showPage('purchases', this)"
                    >
                        <i className="fas fa-shopping-cart text-gray-500 w-6 mr-3"></i>
                        <span className="sidebar-text">Purchases</span>
                    </a>
                    <a
                        href="#"
                        className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                        onclick="showPage('sales', this)"
                    >
                        <i className="fas fa-cash-register text-gray-500 w-6 mr-3"></i>
                        <span className="sidebar-text">Sales</span>
                    </a>
                    <a
                        href="#"
                        className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                        onclick="showPage('inventory', this)"
                    >
                        <i className="fas fa-warehouse text-gray-500 w-6 mr-3"></i>
                        <span className="sidebar-text">Inventory</span>
                    </a>
                    <a
                        href="#"
                        className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                        onclick="showPage('reports', this)"
                    >
                        <i className="fas fa-chart-bar text-gray-500 w-6 mr-3"></i>
                        <span className="sidebar-text">Reports</span>
                    </a>

                    <div id="admin-links">
                        <div className="px-4 py-2 mt-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Administration
                        </div>
                        <a
                            href="#"
                            className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                            onclick="showPage('users', this)"
                        >
                            <i className="fas fa-users-cog text-gray-500 w-6 mr-3"></i>
                            <span className="sidebar-text">
                                User Management
                            </span>
                        </a>
                        <a
                            href="#"
                            className="sidebar-link flex items-center px-4 py-3 rounded-md text-gray-700"
                            onclick="showPage('settings', this)"
                        >
                            <i className="fas fa-cog text-gray-500 w-6 mr-3"></i>
                            <span className="sidebar-text">Settings</span>
                        </a>
                    </div>
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
                    <button onclick="logout()" className="ml-auto text-gray-400 hover:text-gray-500">
                        <i className="fas fa-sign-out-alt"></i>
                    </button>
                </div>
            </div> */}
        </div>
    );
};

export default Sidebar;
