import React from "react";
import { Link, usePage, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, EyeIcon, Trash2Icon } from "lucide-react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

export default function Index() {
    const { purchases, filters, auth } = usePage().props;
    const list = purchases?.data ?? [];
    const permissions = auth.user?.permissions || [];
    const { delete: destroy, processing } = useForm();

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this purchase?")) {
            destroy(route("purchases.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout title="Purchases">
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="heading">Purchases</h3>
                    <Link
                        href={route("purchases.create")}
                        className="create-button"
                    >
                        Create Purchase
                    </Link>
                </div>
                <IndexFilters
                    routeName="purchases.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search purchases..."
                    className="mb-4"
                />

                <div className="table-div">
                    {list.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">SI</th>
                                    <th className="custom-th">Invoice</th>
                                    <th className="custom-th">Supplier</th>
                                    <th className="custom-th">Branch</th>
                                    <th className="custom-th">Total</th>
                                    <th className="custom-th">Paid</th>
                                    <th className="custom-th">Due</th>
                                    <th className="custom-th">Payment Status</th>
                                    <th className="custom-th">Date</th>
                                    <th className="custom-th rounded-r-md">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((purchase, index) => (
                                    <tr key={purchase.id} className="custom-body-tr">
                                        <td className="custom-body-td">
                                            {(purchases.current_page - 1) * purchases.per_page + index + 1}
                                        </td>
                                        <td className="custom-body-td">
                                            {purchase.invoice_no}
                                        </td>
                                        <td className="custom-body-td">
                                            {purchase.supplier?.name || purchase.supplier_name}
                                        </td>
                                        <td className="custom-body-td">
                                            {purchase.branch?.name || "N/A"}
                                        </td>
                                        <td className="custom-body-td">
                                            {purchase.total_amount}
                                        </td>
                                        <td className="custom-body-td">
                                            {purchase.paid_amount}
                                        </td>
                                        <td className="custom-body-td">
                                            {purchase.due_amount}
                                        </td>
                                        <td className="custom-body-td">
                                            {purchase.payment_status}
                                        </td>
                                        <td className="custom-body-td">
                                            {purchase.purchase_date}
                                        </td>
                                        <td className="custom-body-td text-center flex items-center gap-2">
                                            <Link
                                                href={route("purchases.show", purchase.id)}
                                                className="edit-button"
                                            >
                                                <EyeIcon className="w-4 h-4 inline" />
                                            </Link>
                                            {permissions.includes("edit purchase") && (
                                            <Link
                                                href={route("purchases.edit", purchase.id)}
                                                className="edit-button"
                                            >
                                                <EditIcon className="w-4 h-4 inline" />
                                            </Link>
                                            )}
                                            <button
                                                onClick={() => handleDelete(purchase.id)}
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
                <Pagination links={purchases?.links} />
            </section>
        </AuthenticatedLayout>
    );
}
