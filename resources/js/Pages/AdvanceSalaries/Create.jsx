import React from "react";
import { useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

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
        <AuthenticatedLayout title="Create Advance Salary">
            <CreatePageLayout
                title="Create Advance Salary"
                description="Record an advance salary arrangement with a clear repayment schedule so employee dues remain traceable and predictable."
                backRoute="advance-salaries.index"
                meta={[
                    { label: "Module", value: "Payroll advances" },
                    { label: "Cycle format", value: "YYYY-MM" },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Advance Planning"
                        items={[
                            {
                                title: "Set realistic installments",
                                description:
                                    "A manageable repayment schedule reduces payroll friction later.",
                            },
                            {
                                title: "Choose the correct start month",
                                description:
                                    "Repayment timing should match your payroll cycle exactly.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={handleSubmit}>
                    <CreateSectionCard
                        title="Advance Details"
                        description="Choose the staff member, set the amount, and define how the advance will be recovered over time."
                        footer={
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="create-button"
                                >
                                    {processing ? "Saving..." : "Create advance"}
                                </button>
                            </div>
                        }
                    >
                        <div className="form-grid">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Staff
                                    </legend>
                                    <select
                                        value={data.staff_id}
                                        onChange={(e) => setData("staff_id", e.target.value)}
                                        className="custom-input"
                                    >
                                        <option value="">Select staff</option>
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
                                        Amount
                                    </legend>
                                    <input
                                        type="number"
                                        value={data.amount}
                                        onChange={(e) => setData("amount", e.target.value)}
                                        className="custom-input"
                                        placeholder="Enter amount"
                                    />
                                </fieldset>
                                {errors.amount ? (
                                    <p className="field-error">{errors.amount}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Installments
                                    </legend>
                                    <input
                                        type="number"
                                        value={data.installments}
                                        onChange={(e) =>
                                            setData("installments", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder="Number of months"
                                    />
                                </fieldset>
                                {errors.installments ? (
                                    <p className="field-error">{errors.installments}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Start month
                                    </legend>
                                    <input
                                        type="text"
                                        value={data.start_month}
                                        onChange={(e) =>
                                            setData("start_month", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder="2026-03"
                                    />
                                </fieldset>
                                {errors.start_month ? (
                                    <p className="field-error">{errors.start_month}</p>
                                ) : null}
                            </div>
                        </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
}
