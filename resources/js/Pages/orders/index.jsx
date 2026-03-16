import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";
import DataTable from "@/Components/DataTable/DataTable";
import { Trash2Icon, EyeIcon, EditIcon } from "lucide-react";
import { dateTimeFormater } from "@/util/DateFormater";
import { usePage } from "@inertiajs/react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

const Index = ({ orders }) => {
    const { filters, auth } = usePage().props;
    const permissions = auth.user?.permissions || [];
    const list = orders?.data ?? [];
    const { delete: destroy, processing } = useForm();
    const currentView = filters?.view || "all";
    const pageTitle =
        currentView === "completed"
            ? "Completed Orders"
            : currentView === "refunded"
            ? "Refunded Orders"
            : "Orders";

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
        { key: "total_amount", label: "Total amount" },
        { key: "payment_status", label: "Payment status" },
        { key: "refund_status", label: "Refund status" },
        { key: "created_at", label: "Created at" },
    ];

    // Convert raw orders → formatted table rows
    const formattedData = list.map((o, i) => ({
        si: (orders.current_page - 1) * orders.per_page + i + 1,
        id: o.id,
        order_number: o.order_number,
        total_amount: o.total_amount,
        payment_status: o.payment_status,
        refund_status: o.refund_status,
        can_edit: o.refund_status === "none" && permissions.includes("edit order"),
        can_delete:
            o.refund_status === "none" && permissions.includes("delete order"),
        created_at: dateTimeFormater(o.created_at),
    }));

    return (
        <AuthenticatedLayout title="Orders">
            <section>
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">{pageTitle}</h3>
                    <Link
                        href={route("orders.create")}
                        className="create-button"
                    >
                        Create Order
                    </Link>
                </div>
                <IndexFilters
                    routeName="orders.index"
                    initialQuery={filters?.q || ""}
                    extraParams={{
                        view: currentView !== "all" ? currentView : undefined,
                    }}
                    placeholder="Search orders..."
                    className="mb-4"
                />

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

                        if (col.key === "refund_status") {
                            return (
                                <span
                                    className={`p-1 rounded-md text-white ${
                                        row.refund_status === "full"
                                            ? "bg-red-600"
                                            : row.refund_status === "partial"
                                            ? "bg-amber-500"
                                            : "bg-slate-500"
                                    }`}
                                >
                                    {row.refund_status === "none"
                                        ? "None"
                                        : row.refund_status
                                              .charAt(0)
                                              .toUpperCase() +
                                          row.refund_status.slice(1)}
                                </span>
                            );
                        }

                        return row[col.key];
                    }}
                    actions={(row) => (
                        <div className="flex gap-2">
                            <Link
                                href={route("orders.show", row.id)}
                                className="show-button"
                                title="View"
                            >
                                <EyeIcon className="w-4 h-4 inline" />
                            </Link>

                            {row.can_edit && (
                                <Link
                                    href={route("orders.edit", row.id)}
                                    className="edit-button"
                                    title="Edit"
                                >
                                    <EditIcon className="w-4 h-4 inline" />
                                </Link>
                            )}

                            {row.can_delete && (
                                <button
                                    onClick={() => handleDelete(row.id)}
                                    disabled={processing}
                                    className="delete-button"
                                    title="Delete"
                                >
                                    <Trash2Icon className="w-4 h-4 inline" />
                                </button>
                            )}
                        </div>
                    )}
                />
                <Pagination links={orders?.links} />
            </section>
        </AuthenticatedLayout>
    );
};
export default Index;
