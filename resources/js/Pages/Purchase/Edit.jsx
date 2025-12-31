import React, { useState } from "react";
import { router, usePage, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";

export default function Edit() {
    const { purchase, products, company_name } = usePage().props;

    const previousPaid = Number(purchase.paid_amount || 0); // total paid before this edit

    const [form, setForm] = useState({
        supplier_name: purchase.supplier_name,
        purchase_date: purchase.purchase_date,
        payment_status: purchase.payment_status,
        new_paid: 0, // new payment entered by user
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
            alert("Payment cannot be negative.");
            return;
        }

        if (cumulativePaid > totalAmount) {
            alert(
                `The payment exceeds the total amount by ৳ ${(cumulativePaid - totalAmount).toFixed(2)}.`
            );
            return;
        }

        // Submit only the new payment to backend
        router.put(route("purchases.update", purchase.id), {
            ...form,
            paid_amount: form.new_paid,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Purchase - ${company_name}`} />
            <div>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"purchases.index"} />
                    <h3 className="text-xl font-semibold">Edit Purchase</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Supplier */}
                    <div className="mb-3">
                        <label>Supplier Name:</label>
                        <input
                            type="text"
                            className="border p-2 w-full"
                            value={form.supplier_name}
                            onChange={(e) =>
                                setForm({ ...form, supplier_name: e.target.value })
                            }
                        />
                    </div>

                    {/* Purchase Date */}
                    <div className="mb-3">
                        <label>Purchase Date:</label>
                        <input
                            type="date"
                            className="border p-2 w-full"
                            value={form.purchase_date}
                            onChange={(e) =>
                                setForm({ ...form, purchase_date: e.target.value })
                            }
                        />
                    </div>

                    {/* Payment Status */}
                    <div className="mb-3">
                        <label>Payment Status:</label>
                        <select
                            className="border p-2 w-full"
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

                    {/* Items */}
                    <div>
                        <h2 className="font-semibold mb-2">Items</h2>
                        {form.items.map((item, i) => (
                            <div key={i} className="grid grid-cols-3 gap-2 mb-2">
                                <select
                                    className="border p-2"
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
                                    className="border p-2"
                                    placeholder="Qty"
                                    value={item.quantity}
                                    min={1}
                                    onChange={(e) =>
                                        updateItem(i, "quantity", e.target.value)
                                    }
                                />

                                <input
                                    type="number"
                                    className="border p-2"
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
                                    <label>New Payment:</label>
                                    <input
                                        type="number"
                                        className="border p-2 w-full"
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
