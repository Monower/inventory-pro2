import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, Head } from "@inertiajs/react";
import DataTable from "@/Components/DataTable/DataTable";
import { usePage } from "@inertiajs/react";

const Index = ({ orders }) => {
    const { company_name } = usePage().props;
    const { delete: destroy, processing } = useForm();

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this order?")) {
            destroy(route("orders.destroy", id), {
                preserveScroll: true,
            });
        }
    };

    // Define columns for DataTable
    const columns = [
        { key: "si", label: "SI" },
        { key: "order_number", label: "Order Number" },
        { key: "customer_name", label: "Customer Name" },
        { key: "total_amount", label: "Total Amount" },
        { key: "paid_amount", label: "Paid Amount" },
        { key: "due_amount", label: "Due Amount" },
        { key: "payment_status", label: "Payment Status" },
    ];

    // Convert raw orders → formatted table rows
    const formattedData = orders.map((o, i) => ({
        si: i + 1,
        id: o.id,
        order_number: o.order_number,
        customer_name: o.customer?.name || "-",
        total_amount: o.total_amount,
        paid_amount: o.paid_amount,
        due_amount: o.due_amount,
        payment_status: o.payment_status,
    }));

    return (
        <AuthenticatedLayout>
            <Head title={`Orders - ${company_name}`} />
            <section>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Orders</h3>
                    <Link
                        href={route("orders.create")}
                        className="create-button"
                    >
                        Create
                    </Link>
                </div>

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={formattedData}
                    renderCell={(col, row) => {
                        // Highlight payment status (optional)
                        if (col.key === "payment_status") {
                            return (
                                <span className="capitalize">
                                    {row.payment_status}
                                </span>
                            );
                        }

                        return row[col.key];
                    }}
                    actions={(row) => (
                        <div className="flex gap-2">
                            <Link
                                href={route("orders.show", row.id)}
                                className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                            >
                                View
                            </Link>

                            <button
                                onClick={() => handleDelete(row.id)}
                                disabled={processing}
                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                            >
                                Delete
                            </button>
                        </div>
                    )}
                />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
