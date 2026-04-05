import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link } from "@inertiajs/react";

const formatCurrency = (value) =>
    new Intl.NumberFormat("en-BD", {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 0,
    }).format(Number(value || 0));

const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString() : "Not set";

const tenantStatusBadge = {
    active: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200",
    suspended:
        "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200",
};

const subscriptionStatusBadge = {
    active: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200",
    trial: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200",
    expired: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200",
    cancelled:
        "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
};

export default function Dashboard({
    summary,
    plan_distribution,
    recent_tenants,
    attention_items,
    generated_at,
}) {
    const topCards = [
        {
            title: "Total tenants",
            value: summary?.total_tenants ?? 0,
            note: `${summary?.active_tenants ?? 0} active workspaces`,
        },
        {
            title: "Active subscriptions",
            value: summary?.active_subscriptions ?? 0,
            note: `${summary?.trial_subscriptions ?? 0} trials in progress`,
        },
        {
            title: "Attention needed",
            value: summary?.attention_count ?? 0,
            note: `${summary?.renewals_due_soon ?? 0} renewals due in 7 days`,
        },
        {
            title: "New this month",
            value: summary?.new_tenants_this_month ?? 0,
            note: `${summary?.platform_users ?? 0} platform users total`,
        },
        {
            title: "MRR",
            value: formatCurrency(summary?.mrr),
            note: "Monthly recurring revenue from active plans",
        },
        {
            title: "ARR",
            value: formatCurrency(summary?.arr),
            note: `${summary?.suspended_tenants ?? 0} suspended tenants`,
        },
    ];

    return (
        <AuthenticatedLayout title="Super Admin Dashboard">
            <section className="space-y-6 px-4">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700 dark:text-sky-300">
                                Super Admin
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Platform health at a glance
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Track workspace growth, subscription risk, and billing momentum without mixing in tenant-level sales or inventory data.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={route("super-admin.tenants.index")}
                                className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700 shadow-sm transition hover:bg-sky-100"
                            >
                                Open tenants
                            </Link>
                            <Link
                                href={route("super-admin.plans.index")}
                                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700 shadow-sm transition hover:bg-amber-100"
                            >
                                Manage plans
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {topCards.map((card) => (
                        <div
                            key={card.title}
                            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                        >
                            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                {card.title}
                            </p>
                            <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                {card.value}
                            </p>
                            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                                {card.note}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5 dark:border-slate-800">
                            <div>
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                    Workspaces needing attention
                                </h2>
                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                    Expired, cancelled, ending soon, or scheduled to cancel.
                                </p>
                            </div>
                            <Link
                                href={route("super-admin.tenants.index")}
                                className="text-sm font-medium text-sky-700 transition hover:text-sky-600 dark:text-sky-300"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                                <thead className="bg-slate-50 dark:bg-slate-950/40">
                                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                        <th className="px-6 py-4">Workspace</th>
                                        <th className="px-6 py-4">Plan</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4">Timeline</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                    {attention_items?.length ? (
                                        attention_items.map((item) => (
                                            <tr key={item.id} className="align-top">
                                                <td className="px-6 py-4">
                                                    <div className="space-y-1">
                                                        <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                            {item.tenant_name}
                                                        </p>
                                                        <p className="text-sm text-slate-500 dark:text-slate-400">
                                                            {item.tenant_slug}
                                                        </p>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                    <div>{item.plan_name || "No plan"}</div>
                                                    <div className="text-slate-400 dark:text-slate-500">
                                                        {item.billing_cycle || "No cycle"}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-2">
                                                        <span
                                                            className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                                                                subscriptionStatusBadge[item.status] ||
                                                                subscriptionStatusBadge.cancelled
                                                            }`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                        <span className="text-sm text-slate-600 dark:text-slate-300">
                                                            {item.attention_label}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                    {formatDate(item.current_period_end)}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan="4"
                                                className="px-6 py-8 text-center text-sm text-slate-500 dark:text-slate-400"
                                            >
                                                Nothing urgent right now.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                Subscription mix
                            </h2>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Compare adoption across your active billing plans.
                            </p>
                            <div className="mt-5 space-y-4">
                                {plan_distribution?.map((plan) => (
                                    <div
                                        key={plan.id}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                    {plan.name}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    {plan.total_subscriptions} total subscriptions
                                                </p>
                                            </div>
                                            <div className="text-right text-sm text-slate-500 dark:text-slate-400">
                                                <div>{formatCurrency(plan.monthly_price)}/mo</div>
                                                <div>{formatCurrency(plan.yearly_price)}/yr</div>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                            <div className="rounded-2xl bg-white px-3 py-3 dark:bg-slate-900">
                                                <p className="text-slate-500 dark:text-slate-400">Active</p>
                                                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                                                    {plan.active_subscriptions_count}
                                                </p>
                                            </div>
                                            <div className="rounded-2xl bg-white px-3 py-3 dark:bg-slate-900">
                                                <p className="text-slate-500 dark:text-slate-400">Trial</p>
                                                <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100">
                                                    {plan.trial_subscriptions_count}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                        Recent tenants
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                        Latest workspaces created on the platform.
                                    </p>
                                </div>
                                <span className="text-xs uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                    {formatDate(generated_at)}
                                </span>
                            </div>
                            <div className="mt-5 space-y-4">
                                {recent_tenants?.map((tenant) => (
                                    <div
                                        key={tenant.id}
                                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                    {tenant.name}
                                                </p>
                                                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                                    {tenant.slug}
                                                </p>
                                            </div>
                                            <span
                                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                                                    tenantStatusBadge[tenant.status] ||
                                                    tenantStatusBadge.suspended
                                                }`}
                                            >
                                                {tenant.status}
                                            </span>
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Created</p>
                                                <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                                                    {formatDate(tenant.created_at)}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500 dark:text-slate-400">Users</p>
                                                <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                                                    {tenant.users_count}
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <p className="text-slate-500 dark:text-slate-400">Subscription</p>
                                                <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                                                    {tenant.subscription?.plan_name || "No plan"}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {tenant.subscription
                                                        ? `${tenant.subscription.status} ${tenant.subscription.billing_cycle ? `• ${tenant.subscription.billing_cycle}` : ""}`
                                                        : "Awaiting setup"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
