import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"; // optional icons
import { EditIcon, Trash2Icon } from "lucide-react";
import { usePage } from "@inertiajs/react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";
import ListPageLayout from "@/Components/List/ListPageLayout";

const Index = ({ customers }) => {
    const { filters } = usePage().props;
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
        <AuthenticatedLayout title="Customers">
            <ListPageLayout
                title="Customers"
                description="Manage customer profiles, contact details, and relationship data in a cleaner directory built for search, editing, and repeat sales workflows."
                actions={
                    <Link href="/customer/create" className="create-button">
                        Create Customer
                    </Link>
                }
                stats={[
                    { label: "Visible records", value: `${list.length}` },
                    { label: "Total records", value: `${customers?.total || 0}` },
                ]}
            >
                <IndexFilters
                    routeName="customers.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search customers..."
                    className="mb-4"
                />

                {/* Table */}
                <div className="table-div">
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
            </ListPageLayout>
        </AuthenticatedLayout>
    );
};

export default Index;
