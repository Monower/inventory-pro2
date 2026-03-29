import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DashboardCard from "../Components/DasboardCard/DashboardCard";

export default function Dashboard({ data }) {
    const totalMetrics = data?.length ?? 0;

    return (
        <AuthenticatedLayout
            title="Dashboard"
        >
            <section className="space-y-6 px-4">
                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                Control Center
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Business overview at a glance
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Review inventory, sales, customers, staff, and
                                money movement from one place. The cards below
                                reflect the latest totals available in the
                                system.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3 sm:w-auto">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Metrics
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {totalMetrics}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Status
                                </p>
                                <p className="text-2xl font-semibold text-emerald-600 dark:text-emerald-300">
                                    Live
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {data?.map((item, index) => {
                        return (
                            <DashboardCard
                                key={index}
                                heading={item?.heading}
                                title={item?.title}
                                icon={item?.icon}
                            />
                        );
                    })}
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
