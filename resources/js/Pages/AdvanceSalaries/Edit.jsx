import React from "react";
import { useForm, Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";

export default function AdvanceEdit({ staff, advanceSalary }) {
    const { company_name } = usePage().props;
    const recoveredAmount =
        Number(advanceSalary.amount || 0) -
        Number(advanceSalary.remaining_amount || 0);
    const { data, setData, put, processing, errors } = useForm({
        staff_id: String(advanceSalary.staff_id ?? ""),
        amount: advanceSalary.amount ?? "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("advance-salaries.update", advanceSalary.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Advance Salary - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"advance-salaries.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Edit advance salary
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Adjust the advance amount while keeping already recovered balance intact.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 gap-2 mb-4 lg:grid-cols-3">
                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Staff
                                    </label>
                                </legend>

                                <select
                                    value={data.staff_id}
                                    onChange={(e) =>
                                        setData("staff_id", e.target.value)
                                    }
                                    className="custom-input"
                                >
                                    <option value="">Select staff</option>
                                    {staff.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.staff_id && (
                                    <p className="text-red-600">{errors.staff_id}</p>
                                )}
                            </fieldset>

                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Amount
                                    </label>
                                </legend>

                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={data.amount}
                                    onChange={(e) =>
                                        setData("amount", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter amount"
                                />
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Already recovered: {recoveredAmount.toFixed(2)}
                                </p>
                                {errors.amount && (
                                    <p className="text-red-600">{errors.amount}</p>
                                )}
                            </fieldset>
                        </div>

                        <div className="w-full flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="create-button"
                            >
                                {processing ? "Saving..." : "Update"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
