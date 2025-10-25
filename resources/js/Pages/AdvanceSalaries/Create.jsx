import React from "react";
import { useForm, Link } from "@inertiajs/react";

export default function AdvanceCreate({ staff }) {
  const { data, setData, post, processing, errors } = useForm({
    staff_id: "",
    amount: "",
    installments: "",
    start_month: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("advance-salaries.store"));
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Advance Salary</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Staff</label>
          <select
            value={data.staff_id}
            onChange={(e) => setData("staff_id", e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="">Select staff</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {errors.staff_id && <p className="text-red-600">{errors.staff_id}</p>}
        </div>

        <div>
          <label>Amount</label>
          <input
            type="number"
            value={data.amount}
            onChange={(e) => setData("amount", e.target.value)}
            className="w-full border p-2 rounded"
          />
          {errors.amount && <p className="text-red-600">{errors.amount}</p>}
        </div>

        <div>
          <label>Installments (months)</label>
          <input
            type="number"
            value={data.installments}
            onChange={(e) => setData("installments", e.target.value)}
            className="w-full border p-2 rounded"
          />
          {errors.installments && (
            <p className="text-red-600">{errors.installments}</p>
          )}
        </div>

        <div>
          <label>Start Month (YYYY-MM)</label>
          <input
            type="text"
            value={data.start_month}
            onChange={(e) => setData("start_month", e.target.value)}
            className="w-full border p-2 rounded"
          />
          {errors.start_month && (
            <p className="text-red-600">{errors.start_month}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={processing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {processing ? "Saving..." : "Save"}
        </button>
      </form>

      <div className="mt-4">
        <Link href={route("advance-salaries.index")} className="text-blue-600">
          ← Back to list
        </Link>
      </div>
    </div>
  );
}
