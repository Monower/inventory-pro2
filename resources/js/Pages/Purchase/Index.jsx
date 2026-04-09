import React from "react";
import { Link, usePage, useForm, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, EyeIcon, Trash2Icon } from "lucide-react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

export default function Index() {
    const { purchase_items, company_name, filters } = usePage().props;
    const list = purchase_items?.data ?? [];
    const { delete: destroy, processing } = useForm();

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this purchase?")) {
            destroy(route("purchases.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Purchases - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">Purchase Module</p>
                            <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Track vendor purchases and payment status</h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">Review stock purchases, supplier details, paid amounts, and line items from one central list.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Visible purchases</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{list.length}</p>
                            </div>
                            <Link
                                href={route("purchases.create")}
                                className="create-button"
                            >
                                Create
                            </Link>
                        </div>
                    </div>
                </div>
                <IndexFilters
                    routeName="purchases.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search purchases..."
                    className="mb-4"
                />

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    {list.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">SI</th>
                                    <th className="custom-th">Invoice</th>
                                    {/* <th className="custom-th">Product</th>
                                    <th className="custom-th">Variant</th>
                                    <th className="custom-th">Supplier</th>
                                    <th className="custom-th">Quantity</th>
                                    <th className="custom-th">Unit Price</th> */}
                                    <th className="custom-th">Total</th>
                                    <th className="custom-th">Paid</th>
                                    <th className="custom-th">Payment Status</th>
                                    <th className="custom-th">Date</th>
                                    <th className="custom-th rounded-r-md">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((item, index) => (
                                    <tr key={item.id} className="custom-body-tr">
                                        <td className="custom-body-td">
                                            {(purchase_items.current_page - 1) * purchase_items.per_page + index + 1}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.purchase?.invoice_no}
                                        </td>
                                        {/* <td className="custom-body-td">
                                            {item.product?.name}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.product_variant?.attribute_value?.name || "Standard"}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.purchase?.supplier_name}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.quantity}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.buying_price}
                                        </td> */}
                                        <td className="custom-body-td">
                                            {item.purchase?.total_amount}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.purchase?.paid_amount}
                                        </td>
                                        <td className="custom-body-td">
                                            <span
                                                className={`p-1 rounded-md text-white ${
                                                    item.purchase?.payment_status === "paid"
                                                        ? "bg-green-600"
                                                        : item.purchase?.payment_status === "pending" ||
                                                            item.purchase?.payment_status === "unpaid"
                                                          ? "bg-red-600"
                                                          : "bg-yellow-600"
                                                }`}
                                            >
                                                {item.purchase?.payment_status === "pending" ||
                                                item.purchase?.payment_status === "unpaid"
                                                    ? "Unpaid"
                                                    : item.purchase?.payment_status
                                                          ?.charAt(0)
                                                          .toUpperCase() +
                                                      item.purchase?.payment_status?.slice(1)}
                                            </span>
                                        </td>
                                        <td className="custom-body-td">
                                            {item.purchase?.purchase_date}
                                        </td>
                                        <td className="custom-body-td text-center flex items-center gap-2">
                                            <Link
                                                href={route("purchases.show", item.purchase?.id)}
                                                className="view-button"
                                                title="View"
                                            >
                                                <EyeIcon className="w-4 h-4 inline" />
                                            </Link>
                                            <Link
                                                href={route("purchases.edit", item.purchase?.id)}
                                                className="edit-button"
                                            >
                                                <EditIcon className="w-4 h-4 inline" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(item.purchase?.id)}
                                                className="delete-button"
                                                disabled={processing}
                                            >
                                                <Trash2Icon className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <Pagination links={purchase_items?.links} />
            </section>
        </AuthenticatedLayout>
    );
}
