import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, Head } from "@inertiajs/react";
import DataTable from "@/Components/DataTable/DataTable";
import { usePage } from "@inertiajs/react";
import { Trash2Icon, EyeIcon } from "lucide-react";
import Alert from "@/Components/Alert/Alert";

const Index = ({ orders }) => {
    const { company_name, flash } = usePage().props;
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
        { key: "order_number", label: "Order number" },
        { key: "customer_name", label: "Customer name" },
        { key: "total_amount", label: "Total amount" },
        { key: "paid_amount", label: "Paid amount" },
        { key: "due_amount", label: "Due amount" },
        { key: "payment_status", label: "Payment status" },
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

                {/* Success message */}
                {flash?.success && (
                    <Alert flash={flash} />
                )}

                {/* Error message */}
                {flash?.error && (
                    <Alert flash={flash} />
                    // <div className="bg-red-100 rounded-lg py-5 px-6 mb-4 text-base text-red-700" role="alert">
                    //     {flash.error}
                    // </div>
                )}

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
                                className="edit-button"
                                title="View"
                            >
                                <EyeIcon className="w-4 h-4 inline" />
                            </Link>

                            <button
                                onClick={() => handleDelete(row.id)}
                                disabled={processing}
                                className="delete-button"
                                title="Delete"
                            >
                                <Trash2Icon className="w-4 h-4 inline" />
                            </button>
                        </div>
                    )}
                />
            </section>
        </AuthenticatedLayout>
    );
};
export default Index;