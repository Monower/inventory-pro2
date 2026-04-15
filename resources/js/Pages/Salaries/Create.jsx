import { useForm, Head, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";

export default function SalaryCreate({ staff, activeAdvanceBalances = {} }) {
    const { company_name } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        staff_id: "",
        month: "",
        bonus: "",
        deductions: "",
        advance_deduction: "",
    });

    const selectedAdvanceBalance = Number(
        activeAdvanceBalances[data.staff_id] || 0
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("salaries.store"));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Generate Salary - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"salaries.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Generate salary
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Create a salary sheet for a selected employee,
                                including bonus, manual deductions, and flexible
                                advance recovery.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">

                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">Employee</label>
                                </legend>

                                <select
                                    value={data.staff_id}
                                    onChange={(e) =>
                                        setData("staff_id", e.target.value)
                                    }
                                    className="custom-input"
                                >
                                    <option value="">Select employee</option>
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
                                    <label>Month</label>
                                </legend>

                                <input
                                    type="date"
                                    value={data.month ? `${data.month}-01` : ""}
                                    onChange={(e) =>
                                        setData("month", e.target.value.slice(0, 7))
                                    }
                                    className="custom-input"
                                    required
                                />
                                {errors.month && (
                                    <p className="text-red-600">
                                        {errors.month}
                                    </p>
                                )}
                            </fieldset>

                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">
                                    <label>Bonus</label>
                                </legend>

                                <input
                                    type="number"
                                    value={data.bonus}
                                    onChange={(e) =>
                                        setData("bonus", e.target.value)
                                    }
                                    className="custom-input"
                                />
                            </fieldset>

                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">
                                    <label>Deductions</label>
                                </legend>

                                <input
                                    type="number"
                                    value={data.deductions}
                                    onChange={(e) =>
                                        setData("deductions", e.target.value)
                                    }
                                    className="custom-input"
                                />
                            </fieldset>

                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">
                                    <label>Advance deduction</label>
                                </legend>

                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={data.advance_deduction}
                                    onChange={(e) =>
                                        setData(
                                            "advance_deduction",
                                            e.target.value
                                        )
                                    }
                                    className="custom-input"
                                    placeholder="Enter manual advance deduction"
                                />
                                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                                    Remaining advance balance: {selectedAdvanceBalance.toFixed(2)}
                                </p>
                                {errors.advance_deduction && (
                                    <p className="text-red-600">
                                        {errors.advance_deduction}
                                    </p>
                                )}
                            </fieldset>
                        </div>

                        <div className="w-full flex justify-end">
                            <button
                                className="create-button"
                                type="submit"
                                disabled={processing}
                            >
                                {processing ? "Saving..." : "Generate"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
