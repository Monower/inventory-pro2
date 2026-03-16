import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Link, useForm, usePage } from "@inertiajs/react";
import { dateTimeFormater } from "@/util/DateFormater";

const Show = ({ order, stockLedger = [] }) => {
    const { auth } = usePage().props;
    const permissions = auth.user?.permissions || [];
    const { data, setData, patch, processing, errors } = useForm({
        order_status: order?.order_status || "confirmed",
    });
    const totalPrice = order?.items.reduce(
        (sum, item) => sum + item?.price * item?.quantity,
        0
    );
    const canRefund =
        permissions.includes("refund order") && order?.can_refund;
    const canEdit =
        permissions.includes("edit order") &&
        order?.refund_status === "none" &&
        (!order?.payments?.length || Number(order?.paid_amount) === 0);
    const canCollectPayment =
        permissions.includes("collect order payment") &&
        order?.can_collect_payment;
    const canChangeStatus = permissions.includes("change order status");

    const refundBadgeClass =
        order?.refund_status === "full"
            ? "bg-red-600"
            : order?.refund_status === "partial"
            ? "bg-yellow-500"
            : "bg-slate-500";
    const orderBadgeClass =
        order?.order_status === "completed"
            ? "bg-emerald-600"
            : order?.order_status === "processing"
            ? "bg-blue-600"
            : order?.order_status === "cancelled"
            ? "bg-rose-600"
            : order?.order_status === "draft"
            ? "bg-slate-500"
            : "bg-violet-600";

    const handleStatusSubmit = (event) => {
        event.preventDefault();
        patch(route("orders.status.update", order.id));
    };

    return (
        <AuthenticatedLayout title="View Order">
            <section>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <BackButton url={"orders.index"} />
                        <h3 className="heading">
                            Order details of: {order?.order_number}
                        </h3>
                    </div>
                    <div className="flex gap-2">
                        {canCollectPayment && (
                            <Link
                                href={route("orders.payments.create", order.id)}
                                className="create-button"
                            >
                                Collect payment
                            </Link>
                        )}
                        {canRefund && (
                            <Link
                                href={route("orders.refunds.create", order.id)}
                                className="create-button"
                            >
                                Process return
                            </Link>
                        )}
                        {canEdit && (
                            <Link
                                href={route("orders.edit", order.id)}
                                className="edit-button"
                                title="Edit"
                            >
                                Edit order
                            </Link>
                        )}
                    </div>
                </div>

                {/* Order info */}
                <div className="bg-background border border-ring shadow-md rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold mb-2">
                        Order information
                    </h4>
                    <p>
                        <strong>Order ID:</strong>{" "}
                        {order?.order_number || "N/A"}
                    </p>
                    <p>
                        <strong>Created at:</strong>{" "}
                        {dateTimeFormater(order?.created_at) || "N/A"}
                    </p>
                    <p>
                        <strong>Last updated at:</strong>{" "}
                        {dateTimeFormater(order?.updated_at) || "N/A"}
                    </p>
                    <p>
                        <strong>Total amount:</strong>{" "}
                        {order?.total_amount || "00.00"}
                    </p>
                    <p>
                        <strong>Paid amount:</strong>{" "}
                        {order?.paid_amount || "00.00"}
                    </p>
                    <p>
                        <strong>Due amount:</strong>{" "}
                        {order?.due_amount || "00.00"}
                    </p>
                    <p>
                        <strong>Refunded amount:</strong>{" "}
                        {order?.refunded_amount || "00.00"}
                    </p>
                    <p>
                        <strong>Order status:</strong>
                        <span className={`ml-2 px-2 py-1 rounded text-white ${orderBadgeClass}`}>
                            {order?.order_status?.charAt(0).toUpperCase() +
                                order?.order_status?.slice(1)}
                        </span>
                    </p>
                    <p>
                        <strong>Payment status:</strong>
                        <span
                            className={`ml-2 px-2 py-1 rounded text-white ${
                                order?.payment_status === "paid"
                                    ? "bg-green-600"
                                    : order?.payment_status === "partial"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                            }`}
                        >
                            {order?.payment_status === "pending"
                                ? "Unpaid"
                                : order?.payment_status
                                      .charAt(0)
                                      .toUpperCase() +
                                  order?.payment_status.slice(1)}
                        </span>
                    </p>
                    <p>
                        <strong>Refund status:</strong>
                        <span className={`ml-2 px-2 py-1 rounded text-white ${refundBadgeClass}`}>
                            {order?.refund_status === "none"
                                ? "None"
                                : order?.refund_status
                                      .charAt(0)
                                      .toUpperCase() +
                                  order?.refund_status.slice(1)}
                        </span>
                    </p>
                </div>

                {canChangeStatus && (
                    <div className="bg-background border border-ring shadow-md rounded-lg p-4 mb-6">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-lg font-semibold">
                                Order lifecycle
                            </h4>
                            <span className="text-sm text-muted-foreground">
                                Move the order through its operational stages.
                            </span>
                        </div>

                        <form
                            onSubmit={handleStatusSubmit}
                            className="flex flex-col gap-3 md:flex-row md:items-end"
                        >
                            <div className="w-full md:max-w-xs">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-2 text-sm">
                                        <label className="required-label">
                                            Order status
                                        </label>
                                    </legend>
                                    <select
                                        value={data.order_status}
                                        onChange={(event) =>
                                            setData("order_status", event.target.value)
                                        }
                                        className="custom-input"
                                    >
                                        {order?.status_options?.map((status) => (
                                            <option key={status} value={status}>
                                                {status.charAt(0).toUpperCase() +
                                                    status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                                <small className="text-destructive">
                                    {errors.order_status}
                                </small>
                            </div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="edit-button"
                            >
                                {processing ? "Saving..." : "Update status"}
                            </button>
                        </form>
                    </div>
                )}

                {/* Customer info */}
                <div className="bg-background border border-ring shadow-md rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold mb-2">
                        Customer information
                    </h4>
                    <p>
                        <strong>Name:</strong> {order?.customer?.name || "N/A"}
                    </p>
                    <p>
                        <strong>Phone:</strong>{" "}
                        {order?.customer?.phone || "N/A"}
                    </p>
                    <p>
                        <strong>Email:</strong>{" "}
                        {order?.customer?.email || "N/A"}
                    </p>
                </div>

                {/* Order Items */}
                <div className="bg-background border border-ring shadow-md rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold mb-4">
                        Products in order
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm border border-gray-200 rounded-lg">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">
                                        Product name
                                    </th>
                                    <th className="custom-th">Unit price</th>
                                    <th className="custom-th">Quantity</th>
                                    <th className="custom-th">Refunded</th>
                                    <th className="custom-th">Refundable</th>
                                    <th className="custom-th rounded-r-md">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {order?.items?.map((item) => (
                                    <tr key={item.id} className="custom-body-tr">
                                        <td className="custom-body-td">
                                            {item?.product?.name}
                                        </td>
                                        <td className="custom-body-td">
                                            {item?.price}
                                        </td>
                                        <td className="custom-body-td">
                                            {item?.quantity}
                                        </td>
                                        <td className="custom-body-td">
                                            {item?.refunded_quantity || 0}
                                        </td>
                                        <td className="custom-body-td">
                                            {item?.refundable_quantity || 0}
                                        </td>
                                        <td className="custom-body-td">
                                            {item?.price * item?.quantity}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="custom-body-tr">
                                    <td
                                        className="custom-body-td text-right"
                                        colSpan={5}
                                    >
                                        Total:
                                    </td>
                                    <td className="custom-body-td">{totalPrice}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                <div className="bg-background border border-ring shadow-md rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-4">Refund history</h4>
                    {order?.refunds?.length ? (
                        <div className="space-y-4">
                            {order.refunds.map((refund) => (
                                <div
                                    key={refund.id}
                                    className="rounded-lg border border-ring p-4"
                                >
                                    <div className="mb-3 grid gap-2 md:grid-cols-4">
                                        <p>
                                            <strong>Case no:</strong> {refund.refund_number}
                                        </p>
                                        <p>
                                            <strong>Date:</strong>{" "}
                                            {dateTimeFormater(refund.refunded_at)}
                                        </p>
                                        <p>
                                            <strong>Type:</strong> {refund.resolution_type}
                                        </p>
                                        <p>
                                            <strong>Refund total:</strong> {refund.total_amount}
                                        </p>
                                    </div>
                                    <div className="mb-3 grid gap-2 md:grid-cols-3">
                                        <p>
                                            <strong>Workflow:</strong>{" "}
                                            {refund.workflow_status}
                                        </p>
                                        <p>
                                            <strong>Refund method:</strong>{" "}
                                            {refund.refund_method}
                                        </p>
                                        <p>
                                            <strong>Replacement total:</strong>{" "}
                                            {refund.replacement_total}
                                        </p>
                                    </div>
                                    {refund.reason && (
                                        <p className="mb-2">
                                            <strong>Reason:</strong> {refund.reason}
                                        </p>
                                    )}
                                    {refund.notes && (
                                        <p className="mb-3">
                                            <strong>Notes:</strong> {refund.notes}
                                        </p>
                                    )}
                                    <div className="overflow-x-auto">
                                        <table className="w-full min-w-[640px] text-sm border border-gray-200 rounded-lg">
                                            <thead className="custom-thead">
                                                <tr>
                                                    <th className="custom-th rounded-l-md">Product</th>
                                                    <th className="custom-th">Qty</th>
                                                    <th className="custom-th">Unit price</th>
                                                    <th className="custom-th">Restocked</th>
                                                    <th className="custom-th rounded-r-md">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {refund.items.map((item) => (
                                                    <tr key={item.id} className="custom-body-tr">
                                                        <td className="custom-body-td">
                                                            {item.product?.name || "N/A"}
                                                        </td>
                                                        <td className="custom-body-td">
                                                            {item.quantity}
                                                        </td>
                                                        <td className="custom-body-td">
                                                            {item.unit_price}
                                                        </td>
                                                        <td className="custom-body-td">
                                                            {item.restock_to_inventory ? "Yes" : "No"}
                                                        </td>
                                                        <td className="custom-body-td">
                                                            {item.total_amount}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {refund.exchange_items?.length ? (
                                        <div className="mt-4 overflow-x-auto">
                                            <table className="w-full min-w-[640px] text-sm border border-gray-200 rounded-lg">
                                                <thead className="custom-thead">
                                                    <tr>
                                                        <th className="custom-th rounded-l-md">
                                                            Replacement product
                                                        </th>
                                                        <th className="custom-th">Qty</th>
                                                        <th className="custom-th">Unit price</th>
                                                        <th className="custom-th rounded-r-md">
                                                            Total
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {refund.exchange_items.map((item) => (
                                                        <tr
                                                            key={item.id}
                                                            className="custom-body-tr"
                                                        >
                                                            <td className="custom-body-td">
                                                                {item.product?.name || "N/A"}
                                                            </td>
                                                            <td className="custom-body-td">
                                                                {item.quantity}
                                                            </td>
                                                            <td className="custom-body-td">
                                                                {item.unit_price}
                                                            </td>
                                                            <td className="custom-body-td">
                                                                {item.total_amount}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No refunds have been recorded for this order yet.
                        </p>
                    )}
                </div>

                <div className="bg-background border border-ring shadow-md rounded-lg p-4 mt-6">
                    <h4 className="text-lg font-semibold mb-4">Payment history</h4>
                    {order?.payments?.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-sm border border-gray-200 rounded-lg">
                                <thead className="custom-thead">
                                    <tr>
                                        <th className="custom-th rounded-l-md">Payment no</th>
                                        <th className="custom-th">Date</th>
                                        <th className="custom-th">Method</th>
                                        <th className="custom-th">Amount</th>
                                        <th className="custom-th">Received by</th>
                                        <th className="custom-th rounded-r-md">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {order.payments.map((payment) => (
                                        <tr key={payment.id} className="custom-body-tr">
                                            <td className="custom-body-td">
                                                {payment.payment_number}
                                            </td>
                                            <td className="custom-body-td">
                                                {dateTimeFormater(payment.paid_at)}
                                            </td>
                                            <td className="custom-body-td">
                                                {payment.payment_method}
                                            </td>
                                            <td className="custom-body-td">
                                                {payment.amount}
                                            </td>
                                            <td className="custom-body-td">
                                                {payment.received_by?.name ||
                                                    payment.receivedBy?.name ||
                                                    "N/A"}
                                            </td>
                                            <td className="custom-body-td">
                                                {payment.notes || "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No payments have been recorded for this order yet.
                        </p>
                    )}
                </div>

                <div className="bg-background border border-ring shadow-md rounded-lg p-4 mt-6">
                    <h4 className="text-lg font-semibold mb-4">Activity timeline</h4>
                    {order?.activity_logs?.length || order?.activityLogs?.length ? (
                        <div className="space-y-3">
                            {(order.activity_logs || order.activityLogs).map((entry) => (
                                <div
                                    key={entry.id}
                                    className="rounded-lg border border-ring p-4"
                                >
                                    <div className="mb-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="font-semibold">{entry.title}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {dateTimeFormater(entry.created_at)}
                                        </p>
                                    </div>
                                    {entry.description && (
                                        <p className="text-sm mb-2">{entry.description}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        By: {entry.causer?.name || "System"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No activity entries are available for this order yet.
                        </p>
                    )}
                </div>

                <div className="bg-background border border-ring shadow-md rounded-lg p-4 mt-6">
                    <h4 className="text-lg font-semibold mb-4">Stock ledger</h4>
                    {stockLedger.length ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-sm border border-gray-200 rounded-lg">
                                <thead className="custom-thead">
                                    <tr>
                                        <th className="custom-th rounded-l-md">Date</th>
                                        <th className="custom-th">Product</th>
                                        <th className="custom-th">Movement</th>
                                        <th className="custom-th">Qty change</th>
                                        <th className="custom-th">Balance after</th>
                                        <th className="custom-th rounded-r-md">Notes</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stockLedger.map((entry) => (
                                        <tr key={entry.id} className="custom-body-tr">
                                            <td className="custom-body-td">
                                                {dateTimeFormater(entry.created_at)}
                                            </td>
                                            <td className="custom-body-td">
                                                {entry.product?.name || "N/A"}
                                            </td>
                                            <td className="custom-body-td">
                                                {entry.movement_type}
                                            </td>
                                            <td className="custom-body-td">
                                                {entry.quantity_change}
                                            </td>
                                            <td className="custom-body-td">
                                                {entry.balance_after}
                                            </td>
                                            <td className="custom-body-td">
                                                {entry.notes || "N/A"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No stock ledger entries are available for this order yet.
                        </p>
                    )}
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Show;
