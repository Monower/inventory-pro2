import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, Head } from "@inertiajs/react";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"; // optional icons
import { EditIcon, Trash2Icon } from "lucide-react";
import { usePage } from "@inertiajs/react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

const Index = ({ customers }) => {
    const { company_name, filters } = usePage().props;
    const list = customers?.data ?? [];
    const { setData, delete: destroy } = useForm({ id: null });
    const [sortField, setSortField] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc"); // or 'desc'

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this customer?")) {
            setData("id", id);
            destroy(route("customer.destroy", id));
        }
    };

    const handleSort = (field) => {
        if (sortField === field) {
            // toggle direction
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortOrder("asc");
        }
    };

    const sortedCustomers = [...list].sort((a, b) => {
        if (!sortField) return 0;
        const valueA = a[sortField]?.toString().toLowerCase() ?? "";
        const valueB = b[sortField]?.toString().toLowerCase() ?? "";
        if (valueA < valueB) return sortOrder === "asc" ? -1 : 1;
        if (valueA > valueB) return sortOrder === "asc" ? 1 : -1;
        return 0;
    });

    const renderSortIcon = (field) => {
        if (sortField !== field) return <ArrowUpDown className="w-4 h-4 inline ml-1 opacity-50" />;
        return sortOrder === "asc" ? (
            <ArrowUp className="w-4 h-4 inline ml-1" />
        ) : (
            <ArrowDown className="w-4 h-4 inline ml-1" />
        );
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Customers - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                Customer Module
                            </p>
                            <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Manage your customer directory
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Search customer records, review contact details,
                                and jump directly into edits from one place.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Visible customers
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {list.length}
                                </p>
                            </div>
                            <Link
                                href="/customer/create"
                                className="create-button"
                            >
                                Create
                            </Link>
                        </div>
                    </div>
                </div>
                <IndexFilters
                    routeName="customers.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search customers..."
                    className="mb-4"
                />

                {/* Table */}
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    {list.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">
                                        SI
                                    </th>
                                    <th className="custom-th" /* onClick={() => handleSort("phone")} */>
                                        Phone {/* {renderSortIcon("phone")} */}
                                    </th>
                                    <th
                                        // onClick={() => handleSort("name")}
                                        className="custom-th cursor-pointer select-none"
                                    >
                                        Name {/* {renderSortIcon("name")} */}
                                    </th>
                                    <th
                                        // onClick={() => handleSort("email")}
                                        className="custom-th cursor-pointer select-none"
                                    >
                                        Email {/* {renderSortIcon("email")} */}
                                    </th>
                                    <th className="custom-th">
                                        Address
                                    </th>
                                    <th className="custom-th rounded-r-md">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedCustomers.map((customer, index) => (
                                    <tr
                                        key={customer.id}
                                        className="custom-body-tr"
                                    >
                                        <td className="custom-body-td">
                                            {(customers.current_page - 1) * customers.per_page + index + 1}
                                        </td>
                                        <td className="custom-body-td">
                                            {customer?.phone}
                                        </td>
                                        <td className="custom-body-td">
                                            {customer?.name?.length < 1 ? "N/A" : customer?.name}
                                        </td>
                                        <td className="custom-body-td">
                                            {customer?.email?.length < 1 ? "N/A" : customer?.email}
                                        </td>
                                        <td className="custom-body-td">
                                            {customer?.address?.length < 1 ? "N/A" : customer.address}
                                        </td>
                                        <td className="custom-body-td text-center flex items-center gap-2">
                                            <Link
                                                href={route("customer.edit", customer.id)}
                                                className="edit-button"
                                            >
                                                <EditIcon className="w-4 h-4 inline" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(customer.id)}
                                                className="delete-button"
                                            >
                                                <Trash2Icon className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <Pagination links={customers?.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
