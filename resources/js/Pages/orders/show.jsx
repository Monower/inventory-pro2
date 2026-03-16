import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Link, usePage } from "@inertiajs/react";
import { dateTimeFormater } from "@/util/DateFormater";

const Show = ({ order }) => {
    const { auth } = usePage().props;
    const permissions = auth.user?.permissions || [];
    const totalPrice = order?.items.reduce(
        (sum, item) => sum + item?.price * item?.quantity,
        0
    );
    const canRefund =
        permissions.includes("refund order") && order?.can_refund;
    const canEdit =
        permissions.includes("edit order") && order?.refund_status === "none";

    const refundBadgeClass =
        order?.refund_status === "full"
            ? "bg-red-600"
            : order?.refund_status === "partial"
            ? "bg-yellow-500"
            : "bg-slate-500";

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
                        {canRefund && (
                            <Link
                                href={route("orders.refunds.create", order.id)}
                                className="create-button"
                            >
                                Refund order
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
                                            <strong>Refund no:</strong> {refund.refund_number}
                                        </p>
                                        <p>
                                            <strong>Date:</strong>{" "}
                                            {dateTimeFormater(refund.refunded_at)}
                                        </p>
                                        <p>
                                            <strong>Method:</strong> {refund.refund_method}
                                        </p>
                                        <p>
                                            <strong>Total:</strong> {refund.total_amount}
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
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">
                            No refunds have been recorded for this order yet.
                        </p>
                    )}
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Show;
