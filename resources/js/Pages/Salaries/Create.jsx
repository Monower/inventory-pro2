import { useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";

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
        <AuthenticatedLayout>
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"salaries.index"} />
                    <h3 className="heading">Generate Salary</h3>
                </div>

                <div>
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
                                    <label>Month (YYYY-MM)</label>
                                </legend>

                                <input
                                    type="text"
                                    value={data.month}
                                    onChange={(e) =>
                                        setData("month", e.target.value)
                                    }
                                    className="custom-input"
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