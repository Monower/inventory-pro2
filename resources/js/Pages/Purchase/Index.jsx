import React from "react";
import { Link, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

export default function Index() {
    const { purchase_items } = usePage().props;

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this purchase?")) {
            router.delete(route("purchases.destroy", id));
        }
    };

    // console.log("purchase_items: ", purchase_items);

    return (
        <AuthenticatedLayout>
            <div className="p-6">
                <div className="flex justify-between mb-4">
                    <h1 className="text-xl font-semibold">All Purchases</h1>
                    <Link
                        href={route("purchases.create")}
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                    >
                        + New Purchase
                    </Link>
                </div>

                <table className="w-full border">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="border p-2">Invoice</th>
                            <th className="border p-2">Product</th>
                            <th className="border p-2">Supplier</th>
                            <th className="border p-2">Quantity</th>
                            <th className="border p-2">Date</th>
                            <th className="border p-2">Total</th>
                            <th className="border p-2">Payment Status</th>
                            <th className="border p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {purchase_items.map((p) => (
                            <tr key={p.id}>
                                <td className="border p-2">{p.purchase.invoice_no}</td>
                                <td className="border p-2">{p.product.name}</td>
                                <td className="border p-2">
                                    {p.purchase.supplier_name}
                                </td>
                                <td className="border p-2">
                                    {p.quantity}
                                </td>
                                <td className="border p-2">
                                    {p.purchase.purchase_date}
                                </td>
                                <td className="border p-2">{p.purchase.total_amount}</td>
                                <td className="border p-2">{p.purchase.payment_status}</td>
                                <td className="border p-2 flex gap-2">
                                    <Link
                                        href={route("purchases.edit", p.purchase.id)}
                                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(p.purchase.id)}
                                        className="bg-red-600 text-white px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </AuthenticatedLayout>
    );
}
