import React from "react";
import { useForm, Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";

export default function AdvanceCreate({ staff }) {
    const { company_name } = usePage().props;
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
        <AuthenticatedLayout>
            <Head title={`Add Advance Salary - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"advance-salaries.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Add advance salary
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Record a staff advance with amount, repayment
                                plan, and starting month details.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">
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
                                    <p className="text-red-600">
                                        {errors.staff_id}
                                    </p>
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
                                    value={data.amount}
                                    onChange={(e) =>
                                        setData("amount", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter amount"
                                />
                                {errors.amount && (
                                    <p className="text-red-600">
                                        {errors.amount}
                                    </p>
                                )}
                            </fieldset>

                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Installments (months)
                                    </label>
                                </legend>

                                <input
                                    type="number"
                                    value={data.installments}
                                    onChange={(e) =>
                                        setData("installments", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter number of installments"
                                />
                                {errors.installments && (
                                    <p className="text-red-600">
                                        {errors.installments}
                                    </p>
                                )}
                            </fieldset>

                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Start Month
                                    </label>
                                </legend>

                                <input
                                    type="date"
                                    value={data.start_month ? `${data.start_month}-01` : ""}
                                    onChange={(e) =>
                                        setData("start_month", e.target.value.slice(0, 7))
                                    }
                                    className="custom-input"
                                    required
                                />
                                {errors.start_month && (
                                    <p className="text-red-600">
                                        {errors.start_month}
                                    </p>
                                )}
                            </fieldset>
                        </div>

                        {/* Submit Button */}
                        <div className="w-full flex justify-end">
                            <button
                                type="submit"
                                disabled={processing}
                                className="create-button"
                            >
                                {processing ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
