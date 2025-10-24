import React from "react";
import { Link, usePage, router } from "@inertiajs/react";

export default function Index() {
  const { purchases } = usePage().props;

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this purchase?")) {
      router.delete(route("purchases.destroy", id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">All Purchases</h1>
        <Link href={route("purchases.create")} className="bg-blue-600 text-white px-4 py-2 rounded">
          + New Purchase
        </Link>
      </div>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Invoice</th>
            <th className="border p-2">Supplier</th>
            <th className="border p-2">Date</th>
            <th className="border p-2">Total</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p.id}>
              <td className="border p-2">{p.invoice_no}</td>
              <td className="border p-2">{p.supplier_name}</td>
              <td className="border p-2">{p.purchase_date}</td>
              <td className="border p-2">{p.total_amount}</td>
              <td className="border p-2 flex gap-2">
                <Link
                  href={route("purchases.edit", p.id)}
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(p.id)}
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
  );
}
