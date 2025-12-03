import React from "react";
import { Link, usePage, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DataTable from "@/Components/DataTable/DataTable";

export default function Index() {
    const { purchase_items } = usePage().props;
    const { delete: destroy, processing } = useForm();

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this purchase?")) {
            destroy(route("purchases.destroy", id));
        }
    };

    // ---- Columns for DataTable ----
    const columns = [
        { key: "invoice_no", label: "Invoice" },
        { key: "product_name", label: "Product" },
        { key: "supplier_name", label: "Supplier" },
        { key: "quantity", label: "Quantity" },
        { key: "purchase_date", label: "Date" },
        { key: "total_amount", label: "Total" },
        { key: "payment_status", label: "Payment Status" },
    ];

    // ---- Format data for DataTable ----
    const tableData = purchase_items.map((item) => ({
        ...item,
        invoice_no: item.purchase.invoice_no,
        product_name: item.product.name,
        supplier_name: item.purchase.supplier_name,
        quantity: item.quantity,
        purchase_date: item.purchase.purchase_date,
        total_amount: item.purchase.total_amount,
        payment_status: item.purchase.payment_status,
        id: item.purchase.id, // for actions
    }));

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

                {/* ---- Reusable DataTable ---- */}
                <DataTable
                    columns={columns}
                    data={tableData}
                    actions={(row) => (
                        <div className="flex gap-2">
                            <Link
                                href={route("purchases.edit", row.id)}
                                className="bg-yellow-500 text-white px-3 py-1 rounded"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => handleDelete(row.id)}
                                className="bg-red-600 text-white px-3 py-1 rounded"
                                disabled={processing}
                            >
                                {processing ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    )}
                    noDataMessage="No purchases found."
                />
            </div>
        </AuthenticatedLayout>
    );
}
