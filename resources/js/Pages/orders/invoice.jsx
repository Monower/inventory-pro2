import { useEffect } from "react";
import { Link, usePage } from "@inertiajs/react";
import { dateTimeFormater } from "@/util/DateFormater";

const Invoice = ({ order }) => {
    const { settings } = usePage().props;
    const subTotal = Number(order?.subtotal_amount || 0);

    useEffect(() => {
        document.title = `${order?.invoice_number || order?.order_number} Invoice`;
    }, [order]);

    return (
        <div className="min-h-screen bg-slate-100 px-4 py-8 print:bg-white print:px-0">
            <div className="mx-auto max-w-4xl print:max-w-none">
                <div className="mb-4 flex justify-between print:hidden">
                    <Link
                        href={route("orders.show", order.id)}
                        className="rounded-md border border-ring bg-white px-4 py-2 text-sm"
                    >
                        Back to order
                    </Link>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="create-button"
                    >
                        Print / Save PDF
                    </button>
                </div>

                <div className="rounded-xl bg-white p-8 shadow-lg print:shadow-none">
                    <div className="mb-8 flex items-start justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
                                Tax Invoice
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                                {settings?.company_name || "Company"}
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Invoice ready for print and PDF export
                            </p>
                        </div>
                        <div className="text-right text-sm text-slate-600">
                            <p>
                                <strong>Invoice:</strong>{" "}
                                {order?.invoice_number || "N/A"}
                            </p>
                            <p>
                                <strong>Order:</strong> {order?.order_number}
                            </p>
                            <p>
                                <strong>Date:</strong>{" "}
                                {dateTimeFormater(order?.created_at)}
                            </p>
                        </div>
                    </div>

                    <div className="mb-8 grid gap-6 md:grid-cols-3">
                        <div>
                            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Bill To
                            </h2>
                            <p className="font-medium text-slate-900">
                                {order?.customer?.name || "N/A"}
                            </p>
                            <p className="text-sm text-slate-600">
                                {order?.customer?.phone || "N/A"}
                            </p>
                            <p className="text-sm text-slate-600">
                                {order?.shipping_address ||
                                    order?.customer?.address ||
                                    "N/A"}
                            </p>
                        </div>
                        <div>
                            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Sales
                            </h2>
                            <p className="text-sm text-slate-600">
                                <strong>Salesperson:</strong>{" "}
                                {order?.salesperson?.name || "N/A"}
                            </p>
                            <p className="text-sm text-slate-600">
                                <strong>Branch:</strong>{" "}
                                {order?.branch_name || "N/A"}
                            </p>
                            <p className="text-sm text-slate-600">
                                <strong>Status:</strong> {order?.order_status}
                            </p>
                        </div>
                        <div>
                            <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Shipping
                            </h2>
                            <p className="text-sm text-slate-600">
                                <strong>Fulfillment:</strong>{" "}
                                {order?.fulfillment_status}
                            </p>
                            <p className="text-sm text-slate-600">
                                <strong>Courier:</strong>{" "}
                                {order?.courier_name || "N/A"}
                            </p>
                            <p className="text-sm text-slate-600">
                                <strong>Tracking:</strong>{" "}
                                {order?.tracking_number || "N/A"}
                            </p>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-900 text-white">
                                <tr>
                                    <th className="px-4 py-3 text-left">Item</th>
                                    <th className="px-4 py-3 text-right">Qty</th>
                                    <th className="px-4 py-3 text-right">Unit</th>
                                    <th className="px-4 py-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {order?.items?.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="border-t border-slate-200"
                                    >
                                        <td className="px-4 py-3">
                                            {item.product?.name || "N/A"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {item.price}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {Number(item.price) * Number(item.quantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-8 ml-auto max-w-sm space-y-2 text-sm text-slate-700">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>{subTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{Number(order?.shipping_charge || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Coupon</span>
                            <span>{order?.coupon_code || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Discount</span>
                            <span>- {Number(order?.discount_amount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tax ({Number(order?.tax_rate || 0).toFixed(2)}%)</span>
                            <span>{Number(order?.tax_amount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900">
                            <span>Total</span>
                            <span>{Number(order?.total_amount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Paid</span>
                            <span>{Number(order?.paid_amount || 0).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Due</span>
                            <span>{Number(order?.due_amount || 0).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoice;
