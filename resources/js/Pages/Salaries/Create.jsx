import React, { useState } from "react";
import { useForm, Link } from "@inertiajs/react";

export default function SalaryCreate({ staff }) {
  const { data, setData, post, processing, errors } = useForm({
    staff_id: "",
    month: "",
    bonus: "",
    deductions: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("salaries.store"));
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Generate Salary</h1>
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
          <label>Month (YYYY-MM)</label>
          <input
            type="text"
            value={data.month}
            onChange={(e) => setData("month", e.target.value)}
            className="w-full border p-2 rounded"
          />
          {errors.month && <p className="text-red-600">{errors.month}</p>}
        </div>

        <div>
          <label>Bonus</label>
          <input
            type="number"
            value={data.bonus}
            onChange={(e) => setData("bonus", e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label>Deductions</label>
          <input
            type="number"
            value={data.deductions}
            onChange={(e) => setData("deductions", e.target.value)}
            className="w-full border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          disabled={processing}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {processing ? "Saving..." : "Generate"}
        </button>
      </form>

      <div className="mt-4">
        <Link href={route("salaries.index")} className="text-blue-600">
          ← Back to list
        </Link>
      </div>
    </div>
  );
}
