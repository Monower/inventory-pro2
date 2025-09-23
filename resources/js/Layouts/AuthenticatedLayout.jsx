import ApplicationLogo from "@/Components/ApplicationLogo";
import Dropdown from "@/Components/Dropdown";
import NavLink from "@/Components/NavLink";
import ResponsiveNavLink from "@/Components/ResponsiveNavLink";
import { Link, usePage } from "@inertiajs/react";
import { useState } from "react";
import Sidebar from "./Sidebar";
import SidebarDropdown from "@/Components/SidebarDropdown";
import { MdOutlineDashboard } from "react-icons/md";
import { FaUsers } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa6";
import { BsBoxes } from "react-icons/bs";
import { BsPersonBoundingBox } from "react-icons/bs";
import { AiOutlineBorderlessTable } from "react-icons/ai";
import { CiDollar } from "react-icons/ci";
import { PiGearSixLight } from "react-icons/pi";

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;
    const { settings } = usePage().props;
    const { url } = usePage();
    const { auth } = usePage().props;
    const permissions = auth.user?.permissions || [];

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link
                                    href="/"
                                    className="flex items-center gap-2"
                                >
                                    <ApplicationLogo logo={settings.logo_url} />
                                    {/* {
                                        settings.company_name &&
                                        <span className="text-lg font-semibold leading-6 text-gray-900">{settings.company_name}</span>
                                    } */}
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

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-500 transition duration-150 ease-in-out hover:text-gray-700 focus:outline-none"
                                            >
                                                {user.name}

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

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
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
                        " sm:hidden"
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route("dashboard")}
                            active={route().current("dashboard")}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={"/customers"}
                            active={route().current("dashboard")}
                        >
                            Customer
                        </ResponsiveNavLink>
                        <ResponsiveNavLink
                            href={"/staffs"}
                            active={route().current("dashboard")}
                        >
                            Staffs
                        </ResponsiveNavLink>

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

                        {(permissions.includes("view role") ||
                            permissions.includes("view user")) && (
                            <SidebarDropdown
                                title="User management"
                                icon={<BsPersonBoundingBox />}
                            >
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
                            <SidebarDropdown
                                title="Order"
                                icon={<AiOutlineBorderlessTable />}
                            >
                                <div className="flex flex-col mt-2 space-y-2">
                                    <Link href="/banks">Bank list</Link>
                                    <Link href="/orders/create">
                                        Create order
                                    </Link>
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

                        {(permissions.includes("view settings") ||
                            permissions.includes("view profile")) && (
                            <SidebarDropdown
                                title="Settings"
                                icon={<PiGearSixLight />}
                            >
                                <div className="flex flex-col mt-2 space-y-2">
                                    <Link href="/profile">Profile</Link>
                                </div>
                                <div className="flex flex-col mt-2 space-y-2">
                                    <Link href="/settings">
                                        General settings
                                    </Link>
                                </div>
                            </SidebarDropdown>
                        )}
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
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
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <div className="flex">
                <Sidebar url={url} />
                <main className="w-full p-4">{children}</main>
            </div>
        </div>
    );
}
