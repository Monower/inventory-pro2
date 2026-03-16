import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Link, usePage } from "@inertiajs/react";
import { dateTimeFormater } from "@/util/DateFormater";

const paymentBadgeClass = (status) => {
    if (status === "paid") return "bg-emerald-600";
    if (status === "partial") return "bg-amber-500";

    return "bg-rose-600";
};

export default function Show({ purchase }) {
    const permissions = usePage().props.auth.user?.permissions || [];
    const canCollectPayment =
        permissions.includes("pay supplier due") && purchase?.can_collect_payment;
    const canEdit = permissions.includes("edit purchase");

    return (
        <AuthenticatedLayout title="View Purchase">
            <section className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <BackButton url={"purchases.index"} />
                        <h3 className="heading">
                            Purchase details of: {purchase?.invoice_no}
                        </h3>
                    </div>
                    <div className="flex gap-2">
                        {canCollectPayment && (
                            <Link
                                href={route("purchases.payments.create", purchase.id)}
                                className="create-button"
                            >
                                Pay due
                            </Link>
                        )}
                        {canEdit && (
                            <Link
                                href={route("purchases.edit", purchase.id)}
                                className="edit-button"
                            >
                                Edit purchase
                            </Link>
                        )}
                    </div>
                </div>

                <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                    <h4 className="mb-3 text-lg font-semibold">Purchase information</h4>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <p><strong>Invoice:</strong> {purchase?.invoice_no}</p>
                        <p><strong>Supplier:</strong> {purchase?.supplier?.name || purchase?.supplier_name || "N/A"}</p>
                        <p><strong>Branch:</strong> {purchase?.branch?.name || "N/A"}</p>
                        <p><strong>Purchase date:</strong> {purchase?.purchase_date || "N/A"}</p>
                        <p><strong>Total amount:</strong> {Number(purchase?.total_amount || 0).toFixed(2)}</p>
                        <p><strong>Paid amount:</strong> {Number(purchase?.paid_amount || 0).toFixed(2)}</p>
                        <p><strong>Due amount:</strong> {Number(purchase?.due_amount || 0).toFixed(2)}</p>
                        <p>
                            <strong>Payment status:</strong>
                            <span className={`ml-2 rounded px-2 py-1 text-white ${paymentBadgeClass(purchase?.payment_status)}`}>
                                {purchase?.payment_status === "unpaid" ? "Unpaid" : purchase?.payment_status}
                            </span>
                        </p>
                        <p><strong>Created at:</strong> {dateTimeFormater(purchase?.created_at)}</p>
                        <p><strong>Updated at:</strong> {dateTimeFormater(purchase?.updated_at)}</p>
                    </div>
                </div>

                <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                    <h4 className="mb-4 text-lg font-semibold">Items</h4>
                    <div className="overflow-x-auto">
                        <table className="custom-table min-w-[820px]">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">Product</th>
                                    <th className="custom-th">Quantity</th>
                                    <th className="custom-th">Buying Price</th>
                                    <th className="custom-th rounded-r-md">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchase?.items?.map((item) => (
                                    <tr key={item.id} className="custom-body-tr">
                                        <td className="custom-body-td">{item.product?.name || "N/A"}</td>
                                        <td className="custom-body-td">{item.quantity}</td>
                                        <td className="custom-body-td">{Number(item.buying_price || 0).toFixed(2)}</td>
                                        <td className="custom-body-td">{Number(item.total || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                    <div className="mb-4 flex items-center justify-between">
                        <h4 className="text-lg font-semibold">Payment history</h4>
                        <span className="text-sm text-muted-foreground">
                            {purchase?.payments?.length || 0} payments recorded
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="custom-table min-w-[1080px]">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">Payment No</th>
                                    <th className="custom-th">Date</th>
                                    <th className="custom-th">Method</th>
                                    <th className="custom-th">Bank / Service</th>
                                    <th className="custom-th">Amount</th>
                                    <th className="custom-th">Received By</th>
                                    <th className="custom-th rounded-r-md">Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchase?.payments?.length ? (
                                    purchase.payments.map((payment) => (
                                        <tr key={payment.id} className="custom-body-tr">
                                            <td className="custom-body-td">{payment.payment_number}</td>
                                            <td className="custom-body-td">{dateTimeFormater(payment.paid_at)}</td>
                                            <td className="custom-body-td">{payment.payment_method}</td>
                                            <td className="custom-body-td">
                                                {payment.payment_channel_label || "N/A"}
                                            </td>
                                            <td className="custom-body-td">{Number(payment.amount || 0).toFixed(2)}</td>
                                            <td className="custom-body-td">{payment.received_by_name || "N/A"}</td>
                                            <td className="custom-body-td">{payment.notes || "N/A"}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="custom-body-tr">
                                        <td className="custom-body-td text-center" colSpan={7}>
                                            No payments recorded yet.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
