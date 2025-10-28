import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";
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
            <section className="px-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="heading">Customers</h3>
                    <Link
                        href="/customer/create"
                        className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 rounded-md hover:opacity-90 transition"
                    >
                        Create
                    </Link>
                </div>

                {/* Table */}
                <div className="p-4 rounded-md bg-[hsl(var(--card))] border border-[hsl(var(--border))] overflow-x-auto">
                    {customers.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <table className="w-full border-separate border-spacing-y-2">
                            <thead className="bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]">
                                <tr>
                                    <th className="py-2 px-3 text-left rounded-l-md">
                                        SI
                                    </th>
                                    <th
                                        onClick={() => handleSort("name")}
                                        className="py-2 px-3 text-left cursor-pointer select-none"
                                    >
                                        Name {renderSortIcon("name")}
                                    </th>
                                    <th
                                        onClick={() => handleSort("email")}
                                        className="py-2 px-3 text-left cursor-pointer select-none"
                                    >
                                        Email {renderSortIcon("email")}
                                    </th>
                                    <th className="py-2 px-3 text-left">
                                        Phone
                                    </th>
                                    <th className="py-2 px-3 text-left">
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
                                        className="text-[hsl(var(--foreground))] bg-[hsl(var(--background))] hover:bg-[hsl(var(--muted))] transition rounded-md"
                                    >
                                        <td className="py-2 px-3 border-t border-[hsl(var(--border))]">
                                            {index + 1}
                                        </td>
                                        <td className="py-2 px-3 border-t border-[hsl(var(--border))]">
                                            {customer.name}
                                        </td>
                                        <td className="py-2 px-3 border-t border-[hsl(var(--border))]">
                                            {customer.email}
                                        </td>
                                        <td className="py-2 px-3 border-t border-[hsl(var(--border))]">
                                            {customer.phone}
                                        </td>
                                        <td className="py-2 px-3 border-t border-[hsl(var(--border))]">
                                            {customer.address}
                                        </td>
                                        <td className="py-2 px-3 border-t border-[hsl(var(--border))] text-center flex justify-center items-center gap-2">
                                            <Link
                                                href={route("customer.edit", customer.id)}
                                                className="bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] py-1 px-3 rounded-md hover:opacity-90 transition"
                                            >
                                                <EditIcon className="w-4 h-4 inline" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(customer.id)}
                                                className="bg-[hsl(var(--destructive))] text-[hsl(var(--destructive-foreground))] py-1 px-3 rounded-md hover:opacity-90 transition"
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