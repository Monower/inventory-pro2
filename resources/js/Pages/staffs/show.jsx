import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Head, Link, usePage } from "@inertiajs/react";

const Show = ({ staff }) => {
    const { company_name } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title={`Employee Details - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <BackButton url="staffs.index" />
                            <div>
                                <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                    Employee details
                                </h3>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                    Review contact, address, and salary information.
                                </p>
                            </div>
                        </div>
                        {staff?.id && (
                            <Link href={route("staff.edit", staff.id)} className="edit-button">
                                Edit
                            </Link>
                        )}
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <dl className="grid gap-4 md:grid-cols-2">
                        <div>
                            <dt className="text-sm text-slate-500 dark:text-slate-400">
                                Name
                            </dt>
                            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                                {staff?.name || "N/A"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-slate-500 dark:text-slate-400">
                                Phone
                            </dt>
                            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                                {staff?.phone || "N/A"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-slate-500 dark:text-slate-400">
                                Email
                            </dt>
                            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                                {staff?.email || "N/A"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-slate-500 dark:text-slate-400">
                                Salary
                            </dt>
                            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                                {staff?.salary || "0"}
                            </dd>
                        </div>
                        <div className="md:col-span-2">
                            <dt className="text-sm text-slate-500 dark:text-slate-400">
                                Address
                            </dt>
                            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                                {staff?.address || "N/A"}
                            </dd>
                        </div>
                    </dl>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Show;
