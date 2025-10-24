import React, { useState } from "react";
import { router, usePage } from "@inertiajs/react";

export default function Edit() {
  const { purchase, products } = usePage().props;
  const [form, setForm] = useState({
    supplier_name: purchase.supplier_name,
    purchase_date: purchase.purchase_date,
    payment_status: purchase.payment_status,
    items: purchase.items.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
      buying_price: i.buying_price,
    })),
  });

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { product_id: "", quantity: 1, buying_price: 0 }],
    });
  };

  const updateItem = (index, key, value) => {
    const updated = [...form.items];
    updated[index][key] = value;
    setForm({ ...form, items: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    router.put(route("purchases.update", purchase.id), form);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl mb-4 font-semibold">Edit Purchase</h1>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Supplier Name:</label>
          <input
            type="text"
            className="border p-2 w-full"
            value={form.supplier_name}
            onChange={(e) => setForm({ ...form, supplier_name: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label>Purchase Date:</label>
          <input
            type="date"
            className="border p-2 w-full"
            value={form.purchase_date}
            onChange={(e) => setForm({ ...form, purchase_date: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label>Payment Status:</label>
          <select
            className="border p-2 w-full"
            value={form.payment_status}
            onChange={(e) => setForm({ ...form, payment_status: e.target.value })}
          >
            <option value="paid">Paid</option>
            <option value="due">Due</option>
          </select>
        </div>

        <div>
          <h2 className="font-semibold mb-2">Items</h2>
          {form.items.map((item, i) => (
            <div key={i} className="grid grid-cols-3 gap-2 mb-2">
              <select
                className="border p-2"
                value={item.product_id}
                onChange={(e) => updateItem(i, "product_id", e.target.value)}
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
                onChange={(e) => updateItem(i, "quantity", e.target.value)}
              />
              <input
                type="number"
                className="border p-2"
                placeholder="Buying Price"
                value={item.buying_price}
                onChange={(e) => updateItem(i, "buying_price", e.target.value)}
              />
            </div>
          ))}

          <button type="button" onClick={addItem} className="bg-blue-500 text-white px-3 py-1 rounded">
            + Add Item
          </button>
        </div>

        <button type="submit" className="mt-4 bg-green-600 text-white px-4 py-2 rounded">
          Update Purchase
        </button>
      </form>
    </div>
  );
}
