import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, Head } from "@inertiajs/react";
import DataTable from "@/Components/DataTable/DataTable";
import { usePage } from "@inertiajs/react";
import { Trash2Icon, EyeIcon } from "lucide-react";
import Alert from "@/Components/Alert/Alert";
import { dateTimeFormater } from "@/util/DateFormater";

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
        // { key: "customer_name", label: "Customer name" },
        { key: "total_amount", label: "Total amount" },
        // { key: "paid_amount", label: "Paid amount" },
        // { key: "due_amount", label: "Due amount" },
        
        { key: "payment_status", label: "Payment status" },
        { key: "created_at", label: "Created at" },
    ];

    // Convert raw orders → formatted table rows
    const formattedData = orders.map((o, i) => ({
        si: i + 1,
        id: o.id,
        order_number: o.order_number,
        // customer_name: o.customer?.name || "-",
        total_amount: o.total_amount,
        // paid_amount: o.paid_amount,
        // due_amount: o.due_amount,
        
        payment_status: o.payment_status,
        created_at: dateTimeFormater(o.created_at),
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

                <Alert flash={flash} />

                {/* Data Table */}
                <DataTable
                    columns={columns}
                    data={formattedData}
                    renderCell={(col, row) => {
                        if (col.key === "payment_status") {
                            return (
                                <span
                                    className={`p-1 rounded-md text-white ${
                                        row.payment_status === "paid"
                                            ? "bg-green-600"
                                            : row.payment_status === "pending"
                                            ? "bg-red-600"
                                            : "bg-yellow-600"
                                    }`}
                                >
                                    {row?.payment_status === "pending"
                                        ? "Unpaid"
                                        : row?.payment_status
                                              .charAt(0)
                                              .toUpperCase() +
                                          row?.payment_status.slice(1)}
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