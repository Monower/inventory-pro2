import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Head, Link, usePage } from "@inertiajs/react";

const money = (value) => Number(value || 0).toFixed(2);

export default function Show({ purchase }) {
    const { company_name } = usePage().props;
    const items = purchase?.items ?? [];

    return (
        <AuthenticatedLayout>
            <Head title={`View purchase - ${company_name}`} />

            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <BackButton url={"purchases.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Purchase details: {purchase?.invoice_no}
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Review invoice details, supplier information, notes, and every purchased item.</p>
                        </div>
                    </div>

                    <Link
                        href={route("purchases.edit", purchase.id)}
                        className="edit-button"
                    >
                        Edit purchase
                    </Link>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <h4 className="text-lg font-semibold mb-3">
                        Purchase information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <p>
                            <strong>Invoice:</strong>{" "}
                            {purchase?.invoice_no || "N/A"}
                        </p>
                        <p>
                            <strong>Supplier:</strong>{" "}
                            {purchase?.supplier_name || "Unknown"}
                        </p>
                        <p>
                            <strong>Purchase date:</strong>{" "}
                            {purchase?.purchase_date || "N/A"}
                        </p>
                        <p>
                            <strong>Payment status:</strong>{" "}
                            {purchase?.payment_status || "N/A"}
                        </p>
                        <p>
                            <strong>Total amount:</strong> ৳{" "}
                            {money(purchase?.total_amount)}
                        </p>
                        <p>
                            <strong>Paid amount:</strong> ৳{" "}
                            {money(purchase?.paid_amount)}
                        </p>
                        <p>
                            <strong>Due amount:</strong> ৳{" "}
                            {money(
                                Number(purchase?.total_amount || 0) -
                                    Number(purchase?.paid_amount || 0)
                            )}
                        </p>
                        <p>
                            <strong>Created at:</strong>{" "}
                            {purchase?.created_at || "N/A"}
                        </p>
                    </div>
                    <p className="mt-3">
                        <strong>Notes:</strong> {purchase?.notes || "N/A"}
                    </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <h4 className="text-lg font-semibold mb-4">
                        Purchased items
                    </h4>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-sm border border-gray-200 rounded-lg">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">SI</th>
                                    <th className="custom-th">Product</th>
                                    <th className="custom-th">Variant</th>
                                    <th className="custom-th">Quantity</th>
                                    <th className="custom-th">Unit Price</th>
                                    <th className="custom-th">Current Avg Cost</th>
                                    <th className="custom-th rounded-r-md">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, index) => (
                                    <tr key={item.id} className="custom-body-tr">
                                        <td className="custom-body-td">
                                            {index + 1}
                                        </td>
                                        <td className="custom-body-td">
                                            {item?.product?.name || "N/A"}
                                        </td>
                                        <td className="custom-body-td">
                                            {item?.product_variant?.attribute_value?.name || "Standard"}
                                        </td>
                                        <td className="custom-body-td">
                                            {item?.quantity}
                                        </td>
                                        <td className="custom-body-td">
                                            ৳ {money(item?.buying_price)}
                                        </td>
                                        <td className="custom-body-td">
                                            ৳ {money(item?.product_variant?.average_cost)}
                                        </td>
                                        <td className="custom-body-td">
                                            ৳ {money(item?.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="custom-body-tr">
                                    <td className="custom-body-td text-right" colSpan={6}>
                                        Total:
                                    </td>
                                    <td className="custom-body-td">
                                        ৳ {money(purchase?.total_amount)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
