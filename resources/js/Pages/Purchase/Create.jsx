import React, { useState } from "react";
import { useForm, Link } from "@inertiajs/react";

export default function Create({ products }) {
  const { data, setData, post, processing } = useForm({
    supplier_name: "",
    purchase_date: "",
    payment_status: "paid",
    items: [],
  });

  const [rows, setRows] = useState([{ product_id: "", quantity: 1, buying_price: 0 }]);

  const addRow = () => setRows([...rows, { product_id: "", quantity: 1, buying_price: 0 }]);
  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  const handleChange = (i, field, value) => {
    const updated = [...rows];
    updated[i][field] = value;
    setRows(updated);
    setData("items", updated);
  };

  const submit = (e) => {
    e.preventDefault();
    post(route("purchases.store"));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">New Purchase</h1>

      <form onSubmit={submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label>Supplier Name</label>
            <input
              type="text"
              className="border p-2 w-full"
              value={data.supplier_name}
              onChange={(e) => setData("supplier_name", e.target.value)}
            />
          </div>
          <div>
            <label>Purchase Date</label>
            <input
              type="date"
              className="border p-2 w-full"
              value={data.purchase_date}
              onChange={(e) => setData("purchase_date", e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label>Payment Status</label>
          <select
            className="border p-2 w-full"
            value={data.payment_status}
            onChange={(e) => setData("payment_status", e.target.value)}
          >
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
          </select>
        </div>

        <h2 className="font-semibold mt-6">Products</h2>
        <table className="w-full border mt-2">
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
                    className="border p-1 w-full"
                    value={row.product_id}
                    onChange={(e) => handleChange(i, "product_id", e.target.value)}
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
                    className="border p-1 w-full"
                    value={row.quantity}
                    onChange={(e) => handleChange(i, "quantity", e.target.value)}
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    min="0"
                    className="border p-1 w-full"
                    value={row.buying_price}
                    onChange={(e) => handleChange(i, "buying_price", e.target.value)}
                  />
                </td>
                <td className="border p-2">
                  ৳ {(row.quantity * row.buying_price).toFixed(2)}
                </td>
                <td className="border p-2">
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

        <button
          type="button"
          onClick={addRow}
          className="mt-2 bg-green-600 text-white px-3 py-1 rounded"
        >
          + Add Row
        </button>

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
  );
}
