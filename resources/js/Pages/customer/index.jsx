import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, Head } from "@inertiajs/react";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"; // optional icons
import { EditIcon, Trash2Icon } from "lucide-react";

const Index = ({ customers }) => {
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

    const sortedCustomers = [...customers].sort((a, b) => {
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
            <Head title="Customers" />
            <section>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="heading">Customers</h3>
                    <Link
                        href="/customer/create"
                        className="create-button"
                    >
                        Create
                    </Link>
                </div>

                {/* Table */}
                <div className="table-div">
                    {customers.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">
                                        SI
                                    </th>
                                    <th
                                        onClick={() => handleSort("name")}
                                        className="custom-th cursor-pointer select-none"
                                    >
                                        Name {renderSortIcon("name")}
                                    </th>
                                    <th
                                        onClick={() => handleSort("email")}
                                        className="custom-th cursor-pointer select-none"
                                    >
                                        Email {renderSortIcon("email")}
                                    </th>
                                    <th className="custom-th">
                                        Phone
                                    </th>
                                    <th className="custom-th">
                                        Address
                                    </th>
                                    <th className="py-2 px-3 text-center rounded-r-md">
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
                                            {index + 1}
                                        </td>
                                        <td className="custom-body-td">
                                            {customer.name}
                                        </td>
                                        <td className="custom-body-td">
                                            {customer.email}
                                        </td>
                                        <td className="custom-body-td">
                                            {customer.phone}
                                        </td>
                                        <td className="custom-body-td">
                                            {customer.address}
                                        </td>
                                        <td className="custom-body-td text-center flex justify-center items-center gap-2">
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
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;