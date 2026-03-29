import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm} from "@inertiajs/react";
import DataTable from "@/Components/DataTable/DataTable";
import { Trash2Icon, EyeIcon, EditIcon } from "lucide-react";
import { dateTimeFormater } from "@/util/DateFormater";
import { usePage } from "@inertiajs/react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

const Index = ({ orders }) => {
    const { filters } = usePage().props;
    const list = orders?.data ?? [];
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
    const formattedData = list.map((o, i) => ({
        si: (orders.current_page - 1) * orders.per_page + i + 1,
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
        <AuthenticatedLayout title="Orders">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                Orders Hub
                            </p>
                            <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Track orders and payment progress
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Review recent orders, check payment status, and
                                jump into create, edit, or view actions from one
                                clean workspace.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Visible orders
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {list.length}
                                </p>
                            </div>
                            <Link
                                href={route("orders.create")}
                                className="create-button"
                            >
                                Create
                            </Link>
                        </div>
                    </div>
                </div>
                <IndexFilters
                    routeName="orders.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search orders..."
                    className="mb-4"
                />

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <DataTable
                        columns={columns}
                        data={formattedData}
                        renderCell={(col, row) => {
                            if (col.key === "payment_status") {
                                return (
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
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
                                    className="show-button"
                                    title="View"
                                >
                                    <EyeIcon className="w-4 h-4 inline" />
                                </Link>

                                <Link
                                    href={route("orders.edit", row.id)}
                                    className="edit-button"
                                    title="Edit"
                                >
                                    <EditIcon className="w-4 h-4 inline" />
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
                </div>
                <Pagination links={orders?.links} />
            </section>
        </AuthenticatedLayout>
    );
};
export default Index;
