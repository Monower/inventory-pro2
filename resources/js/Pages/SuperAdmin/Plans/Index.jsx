import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

export default function Index({ plans, trial_notice_message }) {
    const { company_name } = usePage().props;
    const { delete: destroy, processing: deleteProcessing } = useForm();
    const {
        data: noticeData,
        setData: setNoticeData,
        put: putNotice,
        processing: noticeProcessing,
        errors: noticeErrors,
    } = useForm({
        trial_notice_message: trial_notice_message || "",
    });

    const removePlan = (planId) => {
        if (confirm("Delete this plan?")) {
            destroy(route("super-admin.plans.destroy", planId));
        }
    };

    const saveTrialNotice = (e) => {
        e.preventDefault();
        putNotice(route("super-admin.plans.trial-notice.update"), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Plans - ${company_name}`} />
            <section className="space-y-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-amber-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700 dark:text-sky-300">Billing Plans</p>
                        <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Manage monthly and yearly products</h1>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Plans define the billing cycle options, trial window, and prices used for renewals and prorated upgrades.</p>
                    </div>
                    <Link href={route("super-admin.plans.create")} className="create-button">Create plan</Link>
                </div>

                <form onSubmit={saveTrialNotice} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Trial warning message</h2>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                This message appears in the dismissible trial banner for tenants during their trial period.
                            </p>
                        </div>
                        <button type="submit" disabled={noticeProcessing} className="create-button px-5 py-2">
                            {noticeProcessing ? "Saving..." : "Save message"}
                        </button>
                    </div>
                    <textarea
                        className="mt-5 min-h-28 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-800"
                        value={noticeData.trial_notice_message}
                        onChange={(e) => setNoticeData("trial_notice_message", e.target.value)}
                        maxLength={255}
                    />
                    <div className="mt-2 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between">
                        {noticeErrors.trial_notice_message ? (
                            <p className="text-red-600">{noticeErrors.trial_notice_message}</p>
                        ) : (
                            <p className="text-slate-500 dark:text-slate-400">Keep it short and clear for all trial users.</p>
                        )}
                        <p className="text-slate-500 dark:text-slate-400">
                            {noticeData.trial_notice_message.length}/255
                        </p>
                    </div>
                </form>

                <div className="grid gap-4 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <div key={plan.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{plan.name}</h2>
                                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{plan.description || "No description added yet."}</p>
                                </div>
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${plan.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                                    {plan.is_active ? "Active" : "Inactive"}
                                </span>
                            </div>
                            <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400">Monthly</p>
                                    <p className="mt-1 text-xl font-semibold">TK {Number(plan.monthly_price).toFixed(2)}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                    <p className="text-slate-500 dark:text-slate-400">Yearly</p>
                                    <p className="mt-1 text-xl font-semibold">TK {Number(plan.yearly_price).toFixed(2)}</p>
                                </div>
                            </div>
                            <div className="mt-4 text-sm text-slate-500 dark:text-slate-400">Trial: {plan.trial_days} days</div>
                            <div className="mt-6 flex gap-2">
                                <Link href={route("super-admin.plans.edit", plan.id)} className="edit-button">Edit</Link>
                                <button type="button" disabled={deleteProcessing} onClick={() => removePlan(plan.id)} className="delete-button">
                                    {deleteProcessing ? "Deleting..." : "Delete"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
