import { Head, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { dateTimeFormater } from "@/util/DateFormater";

const formatAmount = (value) =>
    new Intl.NumberFormat("en-BD", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Number(value || 0));

const paymentMethodLabel = (order) => {
    if (order?.payment_method === "bank") {
        return order?.bank?.name ? `Bank - ${order.bank.name}` : "Bank";
    }

    if (order?.payment_method === "mobile") {
        return order?.mfs ? `Mobile - ${order.mfs}` : "Mobile banking";
    }

    return "Cash";
};

const Print = ({ order, documentType, receiptSettings }) => {
    const { auth, settings } = usePage().props;
    const isReceipt = documentType === "receipt";
    const subtotal = order?.items?.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0
    );

    const business = {
        company_name:
            receiptSettings?.company_name || settings?.company_name || "Inventory Pro",
        company_address: receiptSettings?.company_address || settings?.company_address || "",
        company_phone: receiptSettings?.company_phone || settings?.company_phone || "",
        receipt_footer:
            receiptSettings?.receipt_footer ||
            settings?.receipt_footer ||
            "Thank you for shopping with us.",
    };

    useEffect(() => {
        const root = document.documentElement;
        const body = document.body;
        const previousColorScheme = root.style.colorScheme;
        const hadDarkClass = root.classList.contains("dark");

        root.style.colorScheme = "light";
        root.classList.remove("dark");
        body.style.backgroundColor = "#f8fafc";
        body.style.color = "#0f172a";

        return () => {
            root.style.colorScheme = previousColorScheme;

            if (hadDarkClass) {
                root.classList.add("dark");
            }

            body.style.backgroundColor = "";
            body.style.color = "";
        };
    }, []);

    return (
        <>
            <Head
                title={`${
                    isReceipt ? "Receipt" : "Invoice"
                } - ${order?.invoice_number || order?.order_number}`}
            />

            <style>{`
                body {
                    background: #f8fafc;
                    color: #0f172a;
                }
                @media print {
                    html {
                        color-scheme: light;
                    }
                    body {
                        background: #ffffff;
                        color: #0f172a;
                    }
                    .print-hide {
                        display: none !important;
                    }
                    .print-shell {
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                    }
                    @page {
                        margin: 12mm;
                    }
                }
            `}</style>

            <div className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900">
                <div className="mx-auto mb-4 flex max-w-5xl items-center justify-between print-hide">
                    <div>
                        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
                            Print Preview
                        </p>
                        <h1 className="text-2xl font-semibold">
                            {isReceipt ? "Receipt" : "Invoice"} preview
                        </h1>
                    </div>
                    <button
                        type="button"
                        onClick={() => window.print()}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Print now
                    </button>
                </div>

                <div
                    className={`print-shell mx-auto rounded-3xl border border-slate-200 bg-white shadow-lg ${
                        isReceipt ? "max-w-md p-6" : "max-w-5xl p-8"
                    }`}
                >
                    <div
                        className={`${
                            isReceipt
                                ? "border-b border-dashed border-slate-300 pb-4 text-center"
                                : "mb-8 flex items-start justify-between border-b border-slate-200 pb-6"
                        }`}
                    >
                        <div>
                            <h2 className="text-2xl font-bold">
                                {business.company_name}
                            </h2>
                            {business.company_address ? (
                                <p className="mt-2 text-sm text-slate-600">
                                    {business.company_address}
                                </p>
                            ) : null}
                            {business.company_phone ? (
                                <p className="text-sm text-slate-600">
                                    Phone: {business.company_phone}
                                </p>
                            ) : null}
                        </div>

                        {!isReceipt ? (
                            <div className="text-right">
                                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-500">
                                    {documentType}
                                </p>
                                <p className="mt-2 text-lg font-semibold">
                                    {order?.invoice_number}
                                </p>
                            </div>
                        ) : null}
                    </div>

                    <div className={`${isReceipt ? "space-y-4 text-sm" : "grid gap-6 md:grid-cols-2"}`}>
                        <div>
                            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Customer
                            </h3>
                            <p className="mt-2 font-medium">
                                {order?.customer?.name || "Walk-in customer"}
                            </p>
                            <p className="text-slate-600">
                                {order?.customer?.phone || "No phone provided"}
                            </p>
                            {order?.customer?.address ? (
                                <p className="text-slate-600">
                                    {order.customer.address}
                                </p>
                            ) : null}
                        </div>

                        <div className={isReceipt ? "" : "md:text-right"}>
                            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                                Sale info
                            </h3>
                            <p className="mt-2">
                                <span className="font-medium">Order:</span>{" "}
                                {order?.order_number}
                            </p>
                            <p>
                                <span className="font-medium">Invoice:</span>{" "}
                                {order?.invoice_number}
                            </p>
                            <p>
                                <span className="font-medium">Date:</span>{" "}
                                {dateTimeFormater(order?.created_at)}
                            </p>
                            <p>
                                <span className="font-medium">Cashier:</span>{" "}
                                {auth?.user?.name || "N/A"}
                            </p>
                        </div>
                    </div>

                    {isReceipt ? (
                        <div className="mt-5 border-t border-dashed border-slate-300 pt-4 text-sm">
                            <div className="space-y-2">
                                {order?.items?.map((item) => (
                                    <div key={item.id} className="border-b border-dashed border-slate-200 pb-2">
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="font-medium">
                                                {item?.product?.name}
                                            </p>
                                            <p className="font-medium">
                                                {formatAmount(item?.price * item?.quantity)}
                                            </p>
                                        </div>
                                        <p className="text-slate-500">
                                            {item?.quantity} x {formatAmount(item?.price)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 space-y-2 border-t border-dashed border-slate-300 pt-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatAmount(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Paid</span>
                                    <span>{formatAmount(order?.paid_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Due</span>
                                    <span>{formatAmount(order?.due_amount)}</span>
                                </div>
                                <div className="flex justify-between text-base font-bold">
                                    <span>Total</span>
                                    <span>{formatAmount(order?.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
                            <table className="min-w-full divide-y divide-slate-200 text-sm">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-700">
                                            Product
                                        </th>
                                        <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                            Unit price
                                        </th>
                                        <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                            Qty
                                        </th>
                                        <th className="px-4 py-3 text-right font-semibold text-slate-700">
                                            Total
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {order?.items?.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3">
                                                {item?.product?.name}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {formatAmount(item?.price)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                {item?.quantity}
                                            </td>
                                            <td className="px-4 py-3 text-right font-medium">
                                                {formatAmount(item?.price * item?.quantity)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    <div
                        className={`${
                            isReceipt
                                ? "mt-5 border-t border-dashed border-slate-300 pt-4 text-sm"
                                : "mt-8 grid gap-6 md:grid-cols-[1fr_320px]"
                        }`}
                    >
                        {!isReceipt ? (
                            <div className="space-y-2 text-sm text-slate-600">
                                <p>
                                    <span className="font-medium text-slate-900">
                                        Payment method:
                                    </span>{" "}
                                    {paymentMethodLabel(order)}
                                </p>
                                <p>
                                    <span className="font-medium text-slate-900">
                                        Payment status:
                                    </span>{" "}
                                    {order?.payment_status}
                                </p>
                                <p>
                                    <span className="font-medium text-slate-900">
                                        Printed by:
                                    </span>{" "}
                                    {auth?.user?.name || "N/A"}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <p>
                                    <span className="font-medium">Payment:</span>{" "}
                                    {paymentMethodLabel(order)}
                                </p>
                                <p>
                                    <span className="font-medium">Status:</span>{" "}
                                    {order?.payment_status}
                                </p>
                            </div>
                        )}

                        <div className="rounded-2xl bg-slate-50 p-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>{formatAmount(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Paid amount</span>
                                    <span>{formatAmount(order?.paid_amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Due amount</span>
                                    <span>{formatAmount(order?.due_amount)}</span>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold">
                                    <span>Total amount</span>
                                    <span>{formatAmount(order?.total_amount)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div
                        className={`${
                            isReceipt
                                ? "mt-5 border-t border-dashed border-slate-300 pt-4 text-center text-xs text-slate-500"
                                : "mt-8 border-t border-slate-200 pt-4 text-sm text-slate-500"
                        }`}
                    >
                        {business.receipt_footer}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Print;
