import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, router, useForm } from "@inertiajs/react";
import DataTable from "@/Components/DataTable/DataTable";
import { Trash2Icon, EyeIcon, EditIcon } from "lucide-react";
import { dateTimeFormater } from "@/util/DateFormater";
import { usePage } from "@inertiajs/react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";
import ListPageLayout from "@/Components/List/ListPageLayout";

const Index = ({ orders, customers = [], staffs = [] }) => {
    const { filters, auth } = usePage().props;
    const permissions = auth.user?.permissions || [];
    const list = orders?.data ?? [];
    const { delete: destroy, processing } = useForm();
    const {
        data: filterData,
        setData: setFilterData,
    } = useForm({
        payment_status: filters?.payment_status || "",
        refund_status: filters?.refund_status || "",
        order_status: filters?.order_status || "",
        fulfillment_status: filters?.fulfillment_status || "",
        customer_id: filters?.customer_id || "",
        salesperson_staff_id: filters?.salesperson_staff_id || "",
        date_from: filters?.date_from || "",
        date_to: filters?.date_to || "",
    });
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

    const applyAdvancedFilters = () => {
        router.get(
            route("orders.index"),
            {
                q: filters?.q || undefined,
                view: currentView !== "all" ? currentView : undefined,
                ...Object.fromEntries(
                    Object.entries(filterData).map(([key, value]) => [
                        key,
                        value || undefined,
                    ])
                ),
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const clearAdvancedFilters = () => {
        const cleared = {
            payment_status: "",
            refund_status: "",
            order_status: "",
            fulfillment_status: "",
            customer_id: "",
            salesperson_staff_id: "",
            date_from: "",
            date_to: "",
        };
        Object.entries(cleared).forEach(([key, value]) => setFilterData(key, value));
        router.get(
            route("orders.index"),
            {
                q: filters?.q || undefined,
                view: currentView !== "all" ? currentView : undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    // Define columns for DataTable
    const columns = [
        { key: "si", label: "SI" },
        { key: "order_number", label: "Order number" },
        { key: "branch_name", label: "Branch" },
        { key: "total_amount", label: "Total amount" },
        { key: "order_status", label: "Order status" },
        { key: "fulfillment_status", label: "Fulfillment" },
        { key: "payment_status", label: "Payment status" },
        { key: "refund_status", label: "Refund status" },
        { key: "created_at", label: "Created at" },
    ];

    // Convert raw orders → formatted table rows
    const formattedData = list.map((o, i) => ({
        si: (orders.current_page - 1) * orders.per_page + i + 1,
        id: o.id,
        order_number: o.order_number,
        branch_name: o.branch?.name || o.branch_name || "N/A",
        total_amount: o.total_amount,
        order_status: o.order_status,
        fulfillment_status: o.fulfillment_status,
        payment_status: o.payment_status,
        refund_status: o.refund_status,
        can_edit:
            o.refund_status === "none" &&
            Number(o.paid_amount || 0) === 0 &&
            permissions.includes("edit order"),
        can_delete:
            o.refund_status === "none" &&
            Number(o.paid_amount || 0) === 0 &&
            permissions.includes("delete order"),
        created_at: dateTimeFormater(o.created_at),
    }));

    return (
        <AuthenticatedLayout title="Orders">
            <ListPageLayout
                title={pageTitle}
                description="Track sales orders with stronger filtering, cleaner status visibility, and faster access to viewing, editing, and follow-up actions."
                actions={
                    <Link
                        href={route("orders.create")}
                        className="create-button"
                    >
                        Create Order
                    </Link>
                }
                stats={[
                    { label: "Visible orders", value: `${list.length}` },
                    { label: "Total orders", value: `${orders?.total || 0}` },
                    { label: "View mode", value: currentView },
                ]}
            >
                <IndexFilters
                    routeName="orders.index"
                    initialQuery={filters?.q || ""}
                    extraParams={{
                        view: currentView !== "all" ? currentView : undefined,
                        payment_status: filterData.payment_status || undefined,
                        refund_status: filterData.refund_status || undefined,
                        order_status: filterData.order_status || undefined,
                        fulfillment_status:
                            filterData.fulfillment_status || undefined,
                        customer_id: filterData.customer_id || undefined,
                        salesperson_staff_id:
                            filterData.salesperson_staff_id || undefined,
                        date_from: filterData.date_from || undefined,
                        date_to: filterData.date_to || undefined,
                    }}
                    placeholder="Search orders..."
                    className="mb-4"
                />

                <div className="mb-4 rounded-lg border border-ring bg-background p-4 shadow-sm">
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                        <select
                            value={filterData.payment_status}
                            onChange={(e) =>
                                setFilterData("payment_status", e.target.value)
                            }
                            className="custom-input"
                        >
                            <option value="">All payment statuses</option>
                            <option value="pending">Pending</option>
                            <option value="partial">Partial</option>
                            <option value="paid">Paid</option>
                        </select>
                        <select
                            value={filterData.refund_status}
                            onChange={(e) =>
                                setFilterData("refund_status", e.target.value)
                            }
                            className="custom-input"
                        >
                            <option value="">All refund statuses</option>
                            <option value="none">None</option>
                            <option value="partial">Partial</option>
                            <option value="full">Full</option>
                        </select>
                        <select
                            value={filterData.order_status}
                            onChange={(e) =>
                                setFilterData("order_status", e.target.value)
                            }
                            className="custom-input"
                        >
                            <option value="">All order statuses</option>
                            <option value="draft">Draft</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                        <select
                            value={filterData.fulfillment_status}
                            onChange={(e) =>
                                setFilterData("fulfillment_status", e.target.value)
                            }
                            className="custom-input"
                        >
                            <option value="">All fulfillment statuses</option>
                            <option value="pending">Pending</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                        </select>
                        <select
                            value={filterData.customer_id}
                            onChange={(e) =>
                                setFilterData("customer_id", e.target.value)
                            }
                            className="custom-input"
                        >
                            <option value="">All customers</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.phone} {customer.name ? `- ${customer.name}` : ""}
                                </option>
                            ))}
                        </select>
                        <select
                            value={filterData.salesperson_staff_id}
                            onChange={(e) =>
                                setFilterData(
                                    "salesperson_staff_id",
                                    e.target.value
                                )
                            }
                            className="custom-input"
                        >
                            <option value="">All salespeople</option>
                            {staffs.map((staff) => (
                                <option key={staff.id} value={staff.id}>
                                    {staff.name}
                                </option>
                            ))}
                        </select>
                        <input
                            type="date"
                            value={filterData.date_from}
                            onChange={(e) => setFilterData("date_from", e.target.value)}
                            className="custom-input"
                        />
                        <input
                            type="date"
                            value={filterData.date_to}
                            onChange={(e) => setFilterData("date_to", e.target.value)}
                            className="custom-input"
                        />
                    </div>
                    <div className="mt-3 flex gap-3">
                        <button
                            type="button"
                            onClick={applyAdvancedFilters}
                            className="edit-button"
                        >
                            Apply filters
                        </button>
                        <button
                            type="button"
                            onClick={clearAdvancedFilters}
                            className="delete-button"
                        >
                            Clear filters
                        </button>
                    </div>
                </div>

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

                        if (col.key === "fulfillment_status") {
                            return (
                                <span
                                    className={`p-1 rounded-md text-white ${
                                        row.fulfillment_status === "delivered"
                                            ? "bg-emerald-600"
                                            : row.fulfillment_status === "shipped"
                                            ? "bg-sky-600"
                                            : row.fulfillment_status === "packed"
                                            ? "bg-amber-500"
                                            : "bg-slate-500"
                                    }`}
                                >
                                    {row.fulfillment_status
                                        .charAt(0)
                                        .toUpperCase() +
                                        row.fulfillment_status.slice(1)}
                                </span>
                            );
                        }

                        if (col.key === "order_status") {
                            return (
                                <span
                                    className={`p-1 rounded-md text-white ${
                                        row.order_status === "completed"
                                            ? "bg-emerald-600"
                                            : row.order_status === "processing"
                                            ? "bg-blue-600"
                                            : row.order_status === "cancelled"
                                            ? "bg-rose-600"
                                            : row.order_status === "draft"
                                            ? "bg-slate-500"
                                            : "bg-violet-600"
                                    }`}
                                >
                                    {row.order_status.charAt(0).toUpperCase() +
                                        row.order_status.slice(1)}
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
            </ListPageLayout>
        </AuthenticatedLayout>
    );
};
export default Index;
