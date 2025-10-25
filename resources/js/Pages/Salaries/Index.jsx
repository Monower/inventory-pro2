import React from "react";
import { Link, usePage, router } from "@inertiajs/react";

export default function SalaryIndex() {
  const { salaries, flash } = usePage().props;

  const markAsPaid = (id) => {
    if (confirm("Mark this salary as paid?")) {
      router.put(route("salaries.markPaid", id), {}, {
        preserveScroll: true,
        onSuccess: () => console.log("Salary marked as paid!"),
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Salary Sheet</h1>
        <Link
          href={route("salaries.create")}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Generate Salary
        </Link>
      </div>

      {flash?.success && (
        <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
          {flash.success}
        </div>
      )}

      <table className="min-w-full bg-white shadow rounded">
        <thead>
          <tr className="bg-gray-100 text-left text-sm uppercase">
            <th className="p-2">Staff</th>
            <th className="p-2">Month</th>
            <th className="p-2">Net Salary</th>
            <th className="p-2">Status</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {salaries.map((s) => (
            <tr key={s.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{s.staff.name}</td>
              <td className="p-2">{s.month}</td>
              <td className="p-2">{s.net_salary}</td>
              <td className="p-2">
                {s.is_paid ? (
                  <span className="text-green-600 font-semibold">Paid</span>
                ) : (
                  <span className="text-red-600 font-semibold">Unpaid</span>
                )}
              </td>
              <td className="p-2">
                {!s.is_paid && (
                  <button
                    onClick={() => markAsPaid(s.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                  >
                    Mark Paid
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
