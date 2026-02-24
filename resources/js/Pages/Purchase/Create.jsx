import React, { useState, useEffect } from "react";
import { useForm, usePage, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";

export default function Create({ products }) {
    const { company_name } = usePage().props;

    const [rows, setRows] = useState([
        { product_id: "", quantity: 1, buying_price: 0 },
    ]);

    const { data, setData, post, processing } = useForm({
        supplier_name: "",
        purchase_date: "",
        payment_status: "paid",
        paid_amount: 0,
        items: rows,
    });

    // keep items synced
    useEffect(() => {
        setData("items", rows);
    }, [rows]);

    // total amount
    const totalAmount = rows.reduce(
        (sum, row) => sum + row.quantity * row.buying_price,
        0
    );

    // auto manage paid amount
    useEffect(() => {
        if (data.payment_status === "paid") {
            setData("paid_amount", totalAmount);
        }

        if (data.payment_status === "unpaid") {
            setData("paid_amount", 0);
        }
    }, [data.payment_status, totalAmount]);

    // prevent partial overpay
    useEffect(() => {
        if (
            data.payment_status === "partial" &&
            data.paid_amount > totalAmount
        ) {
            setData("paid_amount", totalAmount);
        }
    }, [data.paid_amount, totalAmount]);

    const addRow = () => {
        setRows([
            ...rows,
            { product_id: "", quantity: 1, buying_price: 0 },
        ]);
    };

    const removeRow = (i) => {
        if (rows.length === 1) return;
        setRows(rows.filter((_, idx) => idx !== i));
    };

    const handleChange = (i, field, value) => {
        const updated = [...rows];
        updated[i][field] =
            field === "quantity" || field === "buying_price"
                ? Number(value)
                : value;
        setRows(updated);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("purchases.store"));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Create Purchase - ${company_name}`} />

            <div>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"purchases.index"} />
                    <h3 className="text-xl font-semibold">New Purchase</h3>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    {/* Supplier & Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label>Supplier Name</label>
                            <input
                                type="text"
                                className="w-full"
                                value={data.supplier_name}
                                onChange={(e) =>
                                    setData("supplier_name", e.target.value)
                                }
                            />
                        </div>

                        <div>
                            <label>Purchase Date</label>
                            <input
                                type="date"
                                className="w-full"
                                value={data.purchase_date}
                                onChange={(e) =>
                                    setData("purchase_date", e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div>
                        <label>Payment Status</label>
                        <select
                            className="w-full"
                            value={data.payment_status}
                            onChange={(e) =>
                                setData("payment_status", e.target.value)
                            }
                        >
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="partial">Partial</option>
                        </select>
                    </div>

                    {/* Products */}
                    <h2 className="font-semibold mt-6">Products</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full border mt-2 min-w-[700px]">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">Product</th>
                                    <th className="border p-2">Quantity</th>
                                    <th className="border p-2">Buying Price</th>
                                    <th className="border p-2">Total</th>
                                    <th className="border p-2"></th>
                                </tr>
                            </thead>

                            <tbody>
                                {rows.map((row, i) => (
                                    <tr key={i}>
                                        <td className="border p-2">
                                            <select
                                                className="w-full py-1"
                                                value={row.product_id}
                                                onChange={(e) =>
                                                    handleChange(
                                                        i,
                                                        "product_id",
                                                        e.target.value
                                                    )
                                                }
                                                required
                                            >
                                                <option value="">Select</option>
                                                {products.map((p) => (
                                                    <option key={p.id} value={p.id}>
                                                        {p.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>

                                        <td className="border p-2">
                                            <input
                                                type="number"
                                                min="1"
                                                className="w-full py-1"
                                                value={row.quantity}
                                                onChange={(e) =>
                                                    handleChange(
                                                        i,
                                                        "quantity",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className="border p-2">
                                            <input
                                                type="number"
                                                min="0"
                                                className="w-full py-1"
                                                value={row.buying_price}
                                                onChange={(e) =>
                                                    handleChange(
                                                        i,
                                                        "buying_price",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </td>

                                        <td className="border p-2">
                                            ৳ {(row.quantity * row.buying_price).toFixed(2)}
                                        </td>

                                        <td className="border p-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeRow(i)}
                                                className="text-red-600"
                                            >
                                                ✕
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <button
                        type="button"
                        onClick={addRow}
                        className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
                    >
                        + Add Row
                    </button>

                    {/* Total & Paid Amount */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="text-lg font-semibold flex items-end">
                            Total Amount: ৳ {totalAmount.toFixed(2)}
                        </div>

                        <div>
                            <label>Paid Amount</label>
                            <input
                                type="number"
                                min="0"
                                className="w-full"
                                value={data.paid_amount}
                                onChange={(e) =>
                                    setData(
                                        "paid_amount",
                                        Number(e.target.value)
                                    )
                                }
                                disabled={data.payment_status !== "partial"}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Save Purchase
                        </button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
