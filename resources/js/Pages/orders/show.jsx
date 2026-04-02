import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import Modal from "@/Components/Modal";
import { Head, usePage, Link } from "@inertiajs/react";
import { dateTimeFormater } from "@/util/DateFormater";
import { Info } from "lucide-react";
import { useState } from "react";

const Show = ({
    order,
    can_print_sales_documents,
    open_order_actions_modal,
}) => {
    const { company_name } = usePage().props;
    const [showActionModal, setShowActionModal] = useState(
        Boolean(open_order_actions_modal)
    );
    const totalPrice = order?.items.reduce(
        (sum, item) => sum + item?.price * item?.quantity,
        0
    );

    return (
        <AuthenticatedLayout>
            <Head title={`View order - ${company_name}`} />
            <Modal
                show={showActionModal}
                onClose={() => setShowActionModal(false)}
                maxWidth="lg"
            >
                <div className="p-6">
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-600">
                        Order created
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                        Order {order?.order_number} is ready
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Choose the next step for this sale.
                    </p>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        {can_print_sales_documents ? (
                            <>
                                <a
                                    href={route("orders.receipt", order.id)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400"
                                >
                                    Print receipt
                                </a>
                                <a
                                    href={route("orders.invoice", order.id)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
                                >
                                    Print invoice
                                </a>
                            </>
                        ) : (
                            <Link
                                href={route("billing.index")}
                                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-amber-400 dark:text-slate-950 dark:hover:bg-amber-300 sm:col-span-2"
                            >
                                Upgrade now to print
                            </Link>
                        )}

                        <Link
                            href={route("orders.create")}
                            className={`inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800 ${
                                can_print_sales_documents ? "" : "sm:col-span-2"
                            }`}
                        >
                            Create another order
                        </Link>
                        <button
                            type="button"
                            onClick={() => setShowActionModal(false)}
                            className={`inline-flex items-center justify-center rounded-xl border border-transparent bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 ${
                                can_print_sales_documents ? "" : "sm:col-span-2"
                            }`}
                        >
                            Stay on this order
                        </button>
                    </div>
                </div>
            </Modal>
            <section>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <BackButton url={"orders.index"} />
                        <h3 className="heading">
                            Order details of: {order?.order_number}
                        </h3>
                    </div>
                    <Link
                        href={route("orders.edit", order.id)}
                        className="edit-button"
                        title="Edit"
                    >
                        Edit order
                    </Link>
                    {can_print_sales_documents ? (
                        <>
                            <a
                                href={route("orders.invoice", order.id)}
                                className="show-button"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Print invoice
                            </a>
                            <a
                                href={route("orders.receipt", order.id)}
                                className="create-button"
                                target="_blank"
                                rel="noreferrer"
                            >
                                Print receipt
                            </a>
                        </>
                    ) : null}
                </div>

                {!can_print_sales_documents ? (
                    <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                        <Info className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>
                            Printable invoices and receipts are available on the Growth plan and above.{" "}
                            <Link
                                href={route("billing.index")}
                                className="font-semibold underline underline-offset-2"
                            >
                                Upgrade now.
                            </Link>
                        </p>
                    </div>
                ) : null}

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
                        <strong>Invoice No:</strong>{" "}
                        {order?.invoice_number || "N/A"}
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
                        <strong>Payment method:</strong>{" "}
                        {order?.payment_method === "bank"
                            ? order?.bank?.name || "Bank"
                            : order?.payment_method === "mobile"
                            ? order?.mfs || "Mobile banking"
                            : "Cash"}
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
                    <p>
                        <strong>Address:</strong>{" "}
                        {order?.customer?.address || "N/A"}
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
                                            {item?.price * item?.quantity}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="custom-body-tr">
                                    <td
                                        className="custom-body-td text-right"
                                        colSpan={3}
                                    >
                                        Total:
                                    </td>
                                    <td className="custom-body-td">{totalPrice}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Show;
