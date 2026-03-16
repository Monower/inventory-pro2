import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";

const branchStockForProduct = (product, branchId) => {
    if (!branchId) {
        return Number(product.stock || 0);
    }

    const inventory = product.branch_inventories?.find(
        (item) => String(item.branch_id) === String(branchId)
    );

    return Number(inventory?.stock || 0);
};

export default function Edit() {
    const { purchase, products, branches = [], suppliers = [], banks = [] } = usePage().props;
    const [clientError, setClientError] = useState("");

    const previousPaid = Number(purchase.paid_amount || 0); // total paid before this edit

    const [form, setForm] = useState({
        supplier_id: purchase.supplier_id || "",
        branch_id: purchase.branch_id || "",
        purchase_date: purchase.purchase_date,
        payment_status: purchase.payment_status,
        new_paid: 0, // new payment entered by user
        payment_method: "cash",
        bank_id: "",
        mfs: "",
        items: purchase.items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            buying_price: i.buying_price,
        })),
    });

    const totalAmount = form.items.reduce(
        (sum, i) => sum + Number(i.quantity) * Number(i.buying_price),
        0
    );

    // Remaining amount is based on total - previously paid
    const remainingAmount = Math.max(totalAmount - previousPaid, 0);

    const addItem = () => {
        setForm({
            ...form,
            items: [...form.items, { product_id: "", quantity: 1, buying_price: 0 }],
        });
    };

    const updateItem = (index, key, value) => {
        const updated = [...form.items];
        updated[index][key] =
            key === "quantity" || key === "buying_price" ? Number(value) : value;
        setForm({ ...form, items: updated });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const cumulativePaid = previousPaid + Number(form.new_paid);

        // Validation
        if (form.new_paid < 0) {
            setClientError("Payment cannot be negative.");
            return;
        }

        if (cumulativePaid > totalAmount) {
            setClientError(
                `The payment exceeds the total amount by ৳ ${(cumulativePaid - totalAmount).toFixed(2)}.`
            );
            return;
        }
        setClientError("");

        // Submit only the new payment to backend
        router.put(route("purchases.update", purchase.id), {
            ...form,
            paid_amount: form.new_paid,
        });
    };

    return (
        <AuthenticatedLayout title="Edit Purchase">
            <div>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"purchases.index"} />
                    <h3 className="text-xl font-semibold">Edit Purchase</h3>
                </div>
                {clientError && (
                    <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                        {clientError}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    {/* Supplier */}
                    <div className="mb-3">
                        <label className="required-label">Supplier:</label>
                        <select
                            className="w-full"
                            value={form.supplier_id}
                            onChange={(e) =>
                                setForm({ ...form, supplier_id: e.target.value })
                            }
                        >
                            <option value="">Select supplier</option>
                            {suppliers.map((supplier) => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name} {supplier.phone ? `- ${supplier.phone}` : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Purchase Date */}
                    <div className="mb-3">
                        <label className="required-label">Branch:</label>
                        <select
                            className="w-full"
                            value={form.branch_id}
                            onChange={(e) =>
                                setForm({ ...form, branch_id: e.target.value })
                            }
                        >
                            <option value="">Select Branch</option>
                            {branches.map((branch) => (
                                <option key={branch.id} value={branch.id}>
                                    {branch.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="required-label">Purchase Date:</label>
                        <input
                            type="date"
                            className="w-full"
                            value={form.purchase_date}
                            onChange={(e) =>
                                setForm({ ...form, purchase_date: e.target.value })
                            }
                        />
                    </div>

                    {/* Payment Status */}
                    <div className="mb-3">
                        <label className="required-label">Payment Status:</label>
                        <select
                            className="w-full"
                            value={form.payment_status}
                            onChange={(e) =>
                                setForm({ ...form, payment_status: e.target.value })
                            }
                        >
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="unpaid">Unpaid</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label className="required-label">Payment Method:</label>
                        <select
                            className="w-full"
                            value={form.payment_method}
                            onChange={(e) =>
                                setForm({ ...form, payment_method: e.target.value })
                            }
                        >
                            <option value="cash">Cash</option>
                            <option value="bank">Bank</option>
                            <option value="mobile">Mobile Banking</option>
                        </select>
                    </div>

                    {form.payment_method === "bank" && (
                        <div className="mb-3">
                            <label className="required-label">Bank:</label>
                            <select
                                className="w-full"
                                value={form.bank_id}
                                onChange={(e) =>
                                    setForm({ ...form, bank_id: e.target.value })
                                }
                            >
                                <option value="">Select bank</option>
                                {banks.map((bank) => (
                                    <option key={bank.id} value={bank.id}>
                                        {bank.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {form.payment_method === "mobile" && (
                        <div className="mb-3">
                            <label className="required-label">Mobile Service:</label>
                            <select
                                className="w-full"
                                value={form.mfs}
                                onChange={(e) =>
                                    setForm({ ...form, mfs: e.target.value })
                                }
                            >
                                <option value="">Select service</option>
                                <option value="bkash">bKash</option>
                                <option value="nagad">Nagad</option>
                                <option value="rocket">Rocket</option>
                            </select>
                        </div>
                    )}

                    {/* Items */}
                    <div>
                        <h2 className="font-semibold mb-2">Items</h2>
                        {form.items.map((item, i) => (
                            <div key={i} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-2">
                                <select
                                    className="w-full"
                                    value={item.product_id}
                                    onChange={(e) =>
                                        updateItem(i, "product_id", e.target.value)
                                    }
                                >
                                    <option value="">Select Product</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>
                                            {p.name}
                                        </option>
                                    ))}
                                </select>

                                <input
                                    type="number"
                                    className="w-full"
                                    placeholder="Qty"
                                    value={item.quantity}
                                    min={1}
                                    onChange={(e) =>
                                        updateItem(i, "quantity", e.target.value)
                                    }
                                />

                                <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
                                    Branch stock:{" "}
                                    {branchStockForProduct(
                                        products.find(
                                            (product) =>
                                                String(product.id) === String(item.product_id)
                                        ) || {},
                                        form.branch_id
                                    )}
                                </div>

                                <input
                                    type="number"
                                    className="w-full"
                                    placeholder="Buying Price"
                                    value={item.buying_price}
                                    min={0}
                                    onChange={(e) =>
                                        updateItem(i, "buying_price", e.target.value)
                                    }
                                />
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={addItem}
                            className="bg-blue-500 text-white px-3 py-1 rounded"
                        >
                            + Add Item
                        </button>
                    </div>

                    {/* Total & Paid / Remaining */}
                    <div className="mt-4">
                        <div className="text-lg font-semibold">
                            Total Amount: ৳ {totalAmount.toFixed(2)}
                        </div>

                        {previousPaid > 0 && (
                            <div className="mt-2">
                                Previously Paid: ৳ {previousPaid.toFixed(2)}
                            </div>
                        )}

                        <div className="mt-2">
                            Remaining: ৳ {remainingAmount.toFixed(2)}
                        </div>

                        {/* New Payment Input */}
                        {(form.payment_status === "partial" || form.payment_status === "unpaid") &&
                            remainingAmount > 0 && (
                                <div className="mt-2">
                                    <label className="required-label">New Payment:</label>
                                    <input
                                        type="number"
                                        className="w-full"
                                        value={form.new_paid}
                                        min={0}
                                        placeholder={`Max: ${remainingAmount}`}
                                        onChange={(e) => {
                                            let val = Number(e.target.value);
                                            if (isNaN(val)) val = 0;
                                            setForm({ ...form, new_paid: val });
                                        }}
                                    />
                                </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Update Purchase
                    </button>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
