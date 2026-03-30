import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Head, useForm, usePage } from "@inertiajs/react";

const currency = (value) => `TK ${Number(value ?? 0).toFixed(2)}`;

export default function Edit({ workspace, plans, subscription, changes }) {
    const { company_name } = usePage().props;
    const { data, setData, put, post, processing, errors } = useForm({
        plan_id: subscription?.plan_id ?? plans[0]?.id ?? "",
        billing_cycle: subscription?.billing_cycle ?? "monthly",
        notes: "",
    });

    const submit = (e) => {
        e.preventDefault();
        put(route("super-admin.tenants.billing.update", workspace.id));
    };

    const renew = () => {
        post(route("super-admin.tenants.billing.renew", workspace.id), {
            data: { notes: data.notes },
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Workspace Billing - ${company_name}`} />
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <BackButton url="super-admin.tenants.index" />
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Manage workspace billing</h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{workspace.name} uses immediate prorated upgrades and end-of-cycle downgrades.</p>
                    </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <h2 className="text-xl font-semibold">Subscription snapshot</h2>
                            {subscription ? (
                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Current plan</p>
                                        <p className="mt-1 font-semibold">{subscription.plan?.name}</p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Cycle</p>
                                        <p className="mt-1 font-semibold capitalize">{subscription.billing_cycle}</p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                                        <p className="mt-1 font-semibold capitalize">{subscription.status}</p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Current period end</p>
                                        <p className="mt-1 font-semibold">{subscription.current_period_end ? new Date(subscription.current_period_end).toLocaleDateString() : "N/A"}</p>
                                    </div>
                                    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800 sm:col-span-2">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Scheduled change</p>
                                        <p className="mt-1 font-semibold">
                                            {subscription.next_plan
                                                ? `${subscription.next_plan.name} (${subscription.next_billing_cycle}) on renewal`
                                                : "No scheduled downgrade"}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">No subscription record found.</p>
                            )}
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <h2 className="text-xl font-semibold">Recent billing events</h2>
                            <div className="mt-5 space-y-3">
                                {changes?.length ? changes.map((change) => (
                                    <div key={change.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold capitalize">{change.event_type.replaceAll("_", " ")}</p>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{change.notes || "No notes provided."}</p>
                                            </div>
                                            <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                                                <div>{change.effective_at ? new Date(change.effective_at).toLocaleDateString() : "Pending"}</div>
                                                <div>Charge: {currency(change.amount)}</div>
                                                {Number(change.credit_amount) > 0 && <div>Credit: {currency(change.credit_amount)}</div>}
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-slate-600 dark:text-slate-300">No billing history yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <h2 className="text-xl font-semibold">Apply billing changes</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Upgrades apply immediately with unused-time credit. Downgrades are scheduled for the next renewal. Renewals extend the active cycle from the current period end.
                        </p>

                        <div className="mt-6 space-y-5">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Target plan</label>
                                <select className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3" value={data.plan_id} onChange={(e) => setData("plan_id", e.target.value)}>
                                    {plans.map((plan) => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} ({currency(plan.monthly_price)}/mo, {currency(plan.yearly_price)}/yr)
                                        </option>
                                    ))}
                                </select>
                                {errors.plan_id && <p className="mt-2 text-sm text-red-600">{errors.plan_id}</p>}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">Billing cycle</label>
                                <select className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3" value={data.billing_cycle} onChange={(e) => setData("billing_cycle", e.target.value)}>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium">Internal note</label>
                                <textarea className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3" value={data.notes} onChange={(e) => setData("notes", e.target.value)} placeholder="Optional note about why this change was made." />
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <button type="submit" disabled={processing} className="create-button px-5 py-2">
                                {processing ? "Saving..." : "Apply plan change"}
                            </button>
                            <button type="button" disabled={processing} onClick={renew} className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100">
                                Record renewal
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
