import Modal from "@/Components/Modal";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import { useState } from "react";

const currency = (value) => `TK ${Number(value ?? 0).toFixed(2)}`;
const PLAN_FEATURES = {
    starter: [
        "Core dashboard and workspace settings",
        "Inventory, products, and category management",
        "Sales, customers, and supplier records",
        "Basic reports for daily operations",
    ],
    growth: [
        "Advanced reporting and business insights",
        "Multi-user team workflows and permissions",
        "Billing visibility and renewal planning",
        "Priority support for growing teams",
    ],
    scale: [
        "Full feature access across all business modules",
        "Higher usage headroom for growing operations",
        "Dedicated onboarding and account assistance",
        "Early access to new platform capabilities",
    ],
};

const PLAN_ORDER = ["starter", "growth", "scale"];

const normalizePlanKey = (plan, index) => {
    const source = `${plan?.slug ?? ""} ${plan?.name ?? ""}`.toLowerCase();

    if (source.includes("starter")) {
        return "starter";
    }

    if (source.includes("growth")) {
        return "growth";
    }

    if (source.includes("scale")) {
        return "scale";
    }

    return PLAN_ORDER[index] ?? "starter";
};

const featuresForPlan = (planKey) => {
    const tierIndex = PLAN_ORDER.indexOf(planKey);

    if (tierIndex === -1) {
        return PLAN_FEATURES.starter;
    }

    return PLAN_ORDER.slice(0, tierIndex + 1).flatMap((key) => PLAN_FEATURES[key]);
};

const allPlanFeatures = PLAN_ORDER.flatMap((key) => PLAN_FEATURES[key]);

export default function Index({ subscription, changes }) {
    const { company_name, billing, billing_plans, auth } = usePage().props;
    const canManageBilling = auth.user?.permissions?.includes("manage billing");
    const [actionModal, setActionModal] = useState(null);
    const { data, setData, put, post, processing } = useForm({
        plan_id: subscription?.plan_id ?? billing_plans?.[0]?.id ?? "",
        billing_cycle: subscription?.billing_cycle ?? "monthly",
    });

    const isCurrentChoice = (planId, cycle) =>
        String(subscription?.plan_id) === String(planId) && subscription?.billing_cycle === cycle;
    const yearlySavings = (plan) => Math.max(0, Number(plan?.monthly_price ?? 0) * 12 - Number(plan?.yearly_price ?? 0));
    const annualDiscountPercent = (plan) => {
        const monthlyTotal = Number(plan?.monthly_price ?? 0) * 12;
        if (!monthlyTotal) {
            return 0;
        }

        return Math.round((yearlySavings(plan) / monthlyTotal) * 100);
    };

    const choosePlan = (planId, cycle) => {
        setData("plan_id", String(planId));
        setData("billing_cycle", cycle);
    };
    const closeActionModal = () => setActionModal(null);
    const priceForCycle = (plan, cycle) => Number(cycle === "yearly" ? plan?.yearly_price ?? 0 : plan?.monthly_price ?? 0);
    const currentPlanIndex = billing_plans?.findIndex((plan) => String(plan.id) === String(subscription?.plan_id)) ?? -1;
    const currentPrice = priceForCycle(subscription?.plan, subscription?.billing_cycle ?? "monthly");

    const getPlanAction = (plan, index) => {
        if (!subscription) {
            return { type: "subscribe", label: "Subscribe" };
        }

        const exactCurrentChoice = isCurrentChoice(plan.id, data.billing_cycle);
        const targetPrice = priceForCycle(plan, data.billing_cycle);

        if (exactCurrentChoice) {
            if (billing?.cancel_at_period_end) {
                return { type: "resume", label: "Resume plan" };
            }

            if (subscription?.status === "expired" || subscription?.status === "cancelled") {
                return { type: "renew", label: "Renew plan" };
            }

            return { type: "cancel", label: "Cancel plan" };
        }

        if (targetPrice > currentPrice || index > currentPlanIndex) {
            return { type: "upgrade", label: "Upgrade" };
        }

        if (targetPrice < currentPrice || index < currentPlanIndex) {
            return { type: "downgrade", label: "Downgrade" };
        }

        return { type: "change", label: "Switch plan" };
    };

    const openActionModal = (type, plan) => {
        choosePlan(plan.id, data.billing_cycle);
        setActionModal({ type, plan });
    };

    const submitAction = () => {
        if (!actionModal) {
            return;
        }

        const options = {
            onSuccess: () => closeActionModal(),
        };

        if (actionModal.type === "subscribe" || actionModal.type === "upgrade" || actionModal.type === "downgrade" || actionModal.type === "change") {
            put(route("billing.update"), options);
            return;
        }

        if (actionModal.type === "cancel") {
            post(route("billing.cancel"), options);
            return;
        }

        if (actionModal.type === "resume") {
            post(route("billing.resume"), options);
            return;
        }

        if (actionModal.type === "renew") {
            post(route("billing.renew"), options);
        }
    };

    const modalConfig = actionModal ? {
        subscribe: {
            title: `Subscribe to ${actionModal.plan.name}?`,
            description: `Your workspace will start on the ${actionModal.plan.name} ${data.billing_cycle} plan as soon as you confirm.`,
            confirmLabel: "Start subscription",
        },
        upgrade: {
            title: `Upgrade to ${actionModal.plan.name}?`,
            description: `Your workspace will move to the ${actionModal.plan.name} ${data.billing_cycle} plan immediately. Any unused time on your current plan will be applied as prorated credit.`,
            confirmLabel: "Confirm upgrade",
        },
        downgrade: {
            title: `Downgrade to ${actionModal.plan.name}?`,
            description: `Your current access stays active until ${billing?.current_period_end || "the end of this billing period"}. The ${actionModal.plan.name} ${data.billing_cycle} plan will start at renewal.`,
            confirmLabel: "Schedule downgrade",
        },
        change: {
            title: `Switch to ${actionModal.plan.name}?`,
            description: `This will update your subscription to the ${actionModal.plan.name} ${data.billing_cycle} plan for the next billing action.`,
            confirmLabel: "Confirm change",
        },
        cancel: {
            title: "Schedule cancellation?",
            description: `Your workspace will remain active until ${billing?.current_period_end || "the end of the current billing period"}. You can resume before that date if you change your mind.`,
            confirmLabel: "Schedule cancellation",
        },
        resume: {
            title: "Resume subscription?",
            description: "This removes the scheduled cancellation and keeps your subscription renewing normally.",
            confirmLabel: "Resume subscription",
        },
        renew: {
            title: "Renew current plan?",
            description: `This renews your ${subscription?.plan?.name} subscription on the current ${subscription?.billing_cycle} cycle.`,
            confirmLabel: "Renew now",
        },
    }[actionModal.type] : null;

    return (
        <AuthenticatedLayout title="Billing">
            <Head title={`Billing - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">Billing Center</p>
                    <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">Track your subscription lifecycle</h1>
                    <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Monthly and yearly plans renew at the end of each billing period. Upgrades take effect immediately with prorated credit. Downgrades stay scheduled until the next renewal so you keep paid access through the current cycle.
                    </p>
                </div>

                {billing?.alert && (
                    <div className={`rounded-2xl border px-5 py-4 ${billing.alert.type === "error" ? "border-red-200 bg-red-50 text-red-800" : billing.alert.type === "warning" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-sky-200 bg-sky-50 text-sky-800"}`}>
                        <p className="font-semibold">{billing.alert.title}</p>
                        <p className="mt-1 text-sm">{billing.alert.message}</p>
                    </div>
                )}

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Current subscription</h2>
                        {subscription ? (
                            <div className="mt-5 grid gap-4 md:grid-cols-2">
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Plan</p>
                                    <p className="mt-1 text-lg font-semibold">{subscription.plan?.name}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Billing cycle</p>
                                    <p className="mt-1 text-lg font-semibold capitalize">{subscription.billing_cycle}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                                    <p className="mt-1 text-lg font-semibold capitalize">{subscription.status}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Days remaining</p>
                                    <p className="mt-1 text-lg font-semibold">{billing?.days_remaining ?? "N/A"}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Renews / ends</p>
                                    <p className="mt-1 text-lg font-semibold">{billing?.current_period_end || "N/A"}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Monthly price</p>
                                    <p className="mt-1 text-lg font-semibold">{currency(subscription.plan?.monthly_price)}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Yearly price</p>
                                    <p className="mt-1 text-lg font-semibold">{currency(subscription.plan?.yearly_price)}</p>
                                </div>
                                <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800 md:col-span-2">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Scheduled change</p>
                                    <p className="mt-1 text-lg font-semibold">
                                        {billing?.cancel_at_period_end
                                            ? "Cancellation at period end"
                                            : billing?.next_plan
                                              ? `${billing.next_plan.name} (${billing.next_plan.billing_cycle}) at renewal`
                                              : "No scheduled changes"}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">No subscription found for this workspace yet.</p>
                        )}
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Available plans</h2>
                        <div className="mt-5 space-y-3">
                            {billing_plans?.map((plan) => (
                                <div key={plan.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-semibold">{plan.name}</p>
                                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plan.description || "Managed by your SaaS administrator."}</p>
                                        </div>
                                        <div className="text-right text-sm">
                                            <div>{currency(plan.monthly_price)} / month</div>
                                            <div>{currency(plan.yearly_price)} / year</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Monthly renews every month. Yearly renews every 12 months. Upgrades start immediately with prorated credit. Downgrades and cancellations are scheduled for the end of the active period.</p>
                    </div>
                </div>

                {canManageBilling && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Manage subscription</h2>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                            Pick a billing cycle, then use the action button on the plan card to subscribe, upgrade, downgrade, cancel, or resume.
                        </p>

                        <div className="mt-6 rounded-[28px] border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                            <div className="grid gap-1 sm:grid-cols-2">
                                <button
                                    type="button"
                                    onClick={() => setData("billing_cycle", "yearly")}
                                    className={`flex items-center justify-center gap-3 rounded-[22px] px-4 py-4 text-sm font-semibold transition ${
                                        data.billing_cycle === "yearly"
                                            ? "bg-emerald-100 text-slate-900 shadow-sm dark:bg-emerald-500/15 dark:text-slate-100"
                                            : "bg-transparent text-slate-500 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                                    }`}
                                >
                                    <span>Annual</span>
                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                                        data.billing_cycle === "yearly"
                                            ? "bg-white text-emerald-700 dark:bg-slate-900 dark:text-emerald-300"
                                            : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-300"
                                    }`}>
                                        Save up to {Math.max(...(billing_plans?.map((plan) => annualDiscountPercent(plan)) ?? [0]))}%
                                    </span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setData("billing_cycle", "monthly")}
                                    className={`rounded-[22px] px-4 py-4 text-sm font-semibold transition ${
                                        data.billing_cycle === "monthly"
                                            ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-slate-100"
                                            : "bg-transparent text-slate-500 hover:bg-white hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                                    }`}
                                >
                                    Monthly
                                </button>
                            </div>
                        </div>

                        <div className="mt-6 grid gap-5 xl:grid-cols-3">
                            {billing_plans?.map((plan, index) => {
                                const isCurrentPlan = isCurrentChoice(plan.id, data.billing_cycle);
                                const displayPrice = data.billing_cycle === "yearly"
                                    ? Number(plan.yearly_price ?? 0) / 12
                                    : Number(plan.monthly_price ?? 0);
                                const billedLabel = data.billing_cycle === "yearly"
                                    ? `${currency(plan.yearly_price)} billed yearly`
                                    : `${currency(plan.monthly_price)} billed monthly`;
                                const savings = yearlySavings(plan);
                                const discount = annualDiscountPercent(plan);
                                const isFeatured = billing_plans?.length > 2 && plan.id === billing_plans?.[1]?.id;
                                const planKey = normalizePlanKey(plan, index);
                                const includedFeatures = featuresForPlan(planKey);
                                const action = getPlanAction(plan, index);
                                const planIsSelected = String(data.plan_id) === String(plan.id);

                                return (
                                    <div
                                        key={plan.id}
                                        className={`rounded-3xl border p-5 shadow-sm transition ${
                                            planIsSelected
                                                ? "border-slate-900 bg-white shadow-lg ring-2 ring-slate-900/10 dark:border-slate-200 dark:bg-slate-900 dark:ring-slate-100/10"
                                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-500"
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{plan.name}</h3>
                                                    {isFeatured && (
                                                        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-medium text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">
                                                            Most popular
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                                    {currency(displayPrice)}
                                                    <span className="text-base font-medium text-slate-500 dark:text-slate-400"> /month</span>
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{billedLabel}</p>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                {isCurrentPlan && (
                                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                                        Current plan
                                                    </span>
                                                )}
                                                {planIsSelected && !isCurrentPlan && (
                                                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white dark:bg-slate-100 dark:text-slate-900">
                                                        Selected
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-left dark:bg-slate-800/60">
                                            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                                                {plan.description || "Built for tenant teams that want dependable day-to-day operations."}
                                            </p>
                                        </div>

                                        <div className="mt-6 space-y-3 text-left text-sm leading-7 text-slate-600 dark:text-slate-300">
                                            {allPlanFeatures.map((feature) => {
                                                const included = includedFeatures.includes(feature);

                                                return (
                                                    <p key={feature} className="flex items-start gap-3">
                                                        <span className={`mt-1 font-semibold ${included ? "text-emerald-600" : "text-rose-500"}`}>
                                                            {included ? "✓" : "✕"}
                                                        </span>
                                                        <span className={included ? "" : "text-slate-400 dark:text-slate-500"}>
                                                            {feature}
                                                        </span>
                                                    </p>
                                                );
                                            })}
                                        </div>

                                        <div className="mt-6 flex items-center justify-between gap-3">
                                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                                {data.billing_cycle === "yearly" && discount > 0
                                                    ? `Save ${discount}% yearly`
                                                    : `${plan.trial_days}-day free trial`}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => openActionModal(action.type, plan)}
                                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                                    action.type === "cancel"
                                                        ? "border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100"
                                                        : action.type === "resume"
                                                          ? "border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100"
                                                          : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                                                }`}
                                            >
                                                {action.label}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Billing history</h2>
                    <div className="mt-5 space-y-3">
                        {changes?.length ? changes.map((change) => (
                            <div key={change.id} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-700">
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <p className="font-semibold capitalize">{change.event_type.replaceAll("_", " ")}</p>
                                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{change.notes || "Billing change recorded."}</p>
                                    </div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">
                                        <div>{change.effective_at ? new Date(change.effective_at).toLocaleDateString() : "Pending"}</div>
                                        <div>Charge: {currency(change.amount)}</div>
                                        {Number(change.credit_amount) > 0 && <div>Credit: {currency(change.credit_amount)}</div>}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-sm text-slate-600 dark:text-slate-300">No billing events recorded yet.</p>
                        )}
                    </div>
                </div>
            </section>

            <Modal show={Boolean(actionModal)} onClose={closeActionModal} maxWidth="lg">
                {actionModal && modalConfig && (
                    <div className="p-6">
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                            Subscription action
                        </p>
                        <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                            {modalConfig.title}
                        </h3>
                        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                            {modalConfig.description}
                        </p>

                        {(actionModal.type === "subscribe" || actionModal.type === "upgrade" || actionModal.type === "downgrade" || actionModal.type === "change") && (
                            <div className="mt-5 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800">
                                <div className="flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-300">
                                    {subscription && (
                                        <p>
                                            Current: <span className="font-semibold text-slate-900 dark:text-slate-100">{subscription?.plan?.name} ({subscription?.billing_cycle})</span>
                                        </p>
                                    )}
                                    <p>
                                        New: <span className="font-semibold text-slate-900 dark:text-slate-100">{actionModal.plan.name} ({data.billing_cycle})</span>
                                    </p>
                                    <p>
                                        Billing amount: <span className="font-semibold text-slate-900 dark:text-slate-100">{currency(priceForCycle(actionModal.plan, data.billing_cycle))}</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        {(actionModal.type === "cancel" || actionModal.type === "resume") && (
                            <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                {actionModal.type === "cancel"
                                    ? `Access continues through ${billing?.current_period_end || "the current period end date"}.`
                                    : "Your current renewal schedule will stay active and no cancellation will be applied."}
                            </div>
                        )}

                        <div className="mt-6 flex flex-wrap justify-end gap-3">
                            <button
                                type="button"
                                onClick={closeActionModal}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                Keep reviewing
                            </button>
                            <button
                                type="button"
                                disabled={processing}
                                onClick={submitAction}
                                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                                    actionModal.type === "cancel"
                                        ? "bg-rose-600 text-white hover:bg-rose-700"
                                        : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                                }`}
                            >
                                {processing ? "Processing..." : modalConfig.confirmLabel}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AuthenticatedLayout>
    );
}
