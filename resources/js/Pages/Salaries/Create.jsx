import { useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

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
        <AuthenticatedLayout title="Create Salary">
            <CreatePageLayout
                title="Create Salary"
                description="Generate a salary entry for a team member with any bonus or deduction adjustments applied before final processing."
                backRoute="salaries.index"
                meta={[
                    { label: "Module", value: "Payroll" },
                    { label: "Cycle format", value: "YYYY-MM" },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Payroll Reminders"
                        items={[
                            {
                                title: "Use one cycle per employee",
                                description:
                                    "A consistent month format prevents duplicate or confusing salary records.",
                            },
                            {
                                title: "Track adjustments separately",
                                description:
                                    "Bonuses and deductions should reflect clear business reasons for future review.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={handleSubmit}>
                    <CreateSectionCard
                        title="Salary Entry"
                        description="Choose the employee and payroll month first, then add any financial adjustments that affect the final payout."
                        footer={
                            <div className="flex justify-end">
                                <button
                                    className="create-button"
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing ? "Saving..." : "Generate salary"}
                                </button>
                            </div>
                        }
                    >
                        <div className="form-grid">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Employee
                                    </legend>
                                    <select
                                        value={data.staff_id}
                                        onChange={(e) => setData("staff_id", e.target.value)}
                                        className="custom-input"
                                    >
                                        <option value="">Select employee</option>
                                        {staff.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                                {errors.staff_id ? (
                                    <p className="field-error">{errors.staff_id}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Month
                                    </legend>
                                    <input
                                        type="text"
                                        value={data.month}
                                        onChange={(e) => setData("month", e.target.value)}
                                        className="custom-input"
                                        placeholder="2026-03"
                                    />
                                </fieldset>
                                {errors.month ? (
                                    <p className="field-error">{errors.month}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Bonus
                                    </legend>
                                    <input
                                        type="number"
                                        value={data.bonus}
                                        onChange={(e) => setData("bonus", e.target.value)}
                                        className="custom-input"
                                        placeholder="Optional bonus amount"
                                    />
                                </fieldset>
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Deductions
                                    </legend>
                                    <input
                                        type="number"
                                        value={data.deductions}
                                        onChange={(e) =>
                                            setData("deductions", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder="Optional deductions"
                                    />
                                </fieldset>
                            </div>
                        </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
}
