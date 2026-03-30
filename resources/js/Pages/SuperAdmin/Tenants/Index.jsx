import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

const badgeClass = {
    active: "border-emerald-200 bg-emerald-50 text-emerald-700",
    suspended: "border-rose-200 bg-rose-50 text-rose-700",
};

export default function Index({ tenants, summary, context }) {
    const { company_name, filters, auth } = usePage().props;
    const { put, post, processing } = useForm();
    const rows = tenants?.data ?? [];

    const updateStatus = (tenant, status) => {
        put(route("super-admin.tenants.update", tenant.id), {
            data: { status },
            preserveScroll: true,
        });
    };

    const switchTenant = (tenant) => {
        post(route("super-admin.tenants.switch", tenant.id), {
            preserveScroll: true,
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Workspaces - ${company_name}`} />

            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-sky-50 via-white to-emerald-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-sky-700 dark:text-sky-300">
                                Super Admin
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Control all tenant workspaces
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Review workspace health, inspect adoption, and suspend access when an account needs intervention.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Tenants</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{summary.total_tenants}</p>
                            </div>
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Active</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{summary.active_tenants}</p>
                            </div>
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Suspended</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{summary.suspended_tenants}</p>
                            </div>
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Users</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{summary.total_users}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <IndexFilters
                    routeName="super-admin.tenants.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search workspaces..."
                    className="mb-4"
                />

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-950/40">
                                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                    <th className="px-5 py-4">Workspace</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4">Usage</th>
                                    <th className="px-5 py-4">Admins</th>
                                    <th className="px-5 py-4">Created</th>
                                    <th className="px-5 py-4 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {rows.map((tenant) => {
                                    const isCurrentTenant = auth.user?.tenant_id === tenant.id;
                                    const isActiveContext = context?.active_tenant_id === tenant.id;
                                    const nextStatus =
                                        tenant.status === "active" ? "suspended" : "active";

                                    return (
                                        <tr key={tenant.id} className="align-top">
                                            <td className="px-5 py-4">
                                                <div className="space-y-1">
                                                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                                                        {tenant.name}
                                                    </p>
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                                        {tenant.slug}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500">
                                                        {tenant.domain || "No custom domain"}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${badgeClass[tenant.status] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}
                                                >
                                                    {tenant.status}
                                                </span>
                                                {isActiveContext && (
                                                    <div className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
                                                        Active context
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                <div>{tenant.users_count} users</div>
                                                <div>{tenant.products_count} products</div>
                                                <div>{tenant.customers_count} customers</div>
                                                <div>{tenant.orders_count} orders</div>
                                                <div className="mt-2 font-medium text-slate-900 dark:text-slate-100">
                                                    {tenant.current_subscription?.plan?.name || "No plan"} {tenant.current_subscription ? `(${tenant.current_subscription.billing_cycle})` : ""}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {tenant.tenant_admins_count}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                {new Date(tenant.created_at).toLocaleDateString()}
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route("super-admin.tenants.billing.edit", tenant.id)}
                                                        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
                                                    >
                                                        Billing
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        disabled={processing || tenant.status !== "active" || isActiveContext}
                                                        onClick={() => switchTenant(tenant)}
                                                        className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {isActiveContext ? "In context" : "Switch"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        disabled={processing || isCurrentTenant}
                                                        onClick={() => updateStatus(tenant, nextStatus)}
                                                        className={
                                                            nextStatus === "suspended"
                                                                ? "rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                                : "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                        }
                                                    >
                                                        {isCurrentTenant
                                                            ? "Home workspace"
                                                            : nextStatus === "suspended"
                                                              ? "Suspend"
                                                              : "Reactivate"}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={tenants?.links} />
            </section>
        </AuthenticatedLayout>
    );
}
