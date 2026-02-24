import React from "react";
import { Link, usePage, useForm, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, Trash2Icon } from "lucide-react";

export default function Index() {
    const { purchase_items, company_name } = usePage().props;
    const { delete: destroy, processing } = useForm();

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this purchase?")) {
            destroy(route("purchases.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Purchases - ${company_name}`} />
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="heading">Purchases</h3>
                    <Link
                        href={route("purchases.create")}
                        className="create-button"
                    >
                        Create
                    </Link>
                </div>

                <div className="table-div">
                    {purchase_items.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">SI</th>
                                    <th className="custom-th">Invoice</th>
                                    <th className="custom-th">Product</th>
                                    <th className="custom-th">Supplier</th>
                                    <th className="custom-th">Quantity</th>
                                    <th className="custom-th">Unit Price</th>
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
                                {purchase_items.map((item, index) => (
                                    <tr key={item.id} className="custom-body-tr">
                                        <td className="custom-body-td">
                                            {index + 1}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.purchase?.invoice_no}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.product?.name}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.purchase?.supplier_name}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.quantity}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.buying_price}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.purchase?.total_amount}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.purchase?.paid_amount}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.purchase?.payment_status}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.purchase?.purchase_date}
                                        </td>
                                        <td className="custom-body-td text-center flex items-center gap-2">
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
            </section>
        </AuthenticatedLayout>
    );
}
