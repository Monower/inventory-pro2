import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Head, Link, usePage } from "@inertiajs/react";

const Show = ({ bank }) => {
    const { company_name } = usePage().props;

    return (
        <AuthenticatedLayout>
            <Head title={`Bank Details - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <BackButton url="banks.index" />
                            <div>
                                <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                    Bank details
                                </h3>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                    Review the selected bank record.
                                </p>
                            </div>
                        </div>
                        {bank?.id && (
                            <Link href={route("banks.edit", bank.id)} className="edit-button">
                                Edit
                            </Link>
                        )}
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <dl className="grid gap-4 md:grid-cols-2">
                        <div>
                            <dt className="text-sm text-slate-500 dark:text-slate-400">
                                Bank name
                            </dt>
                            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                                {bank?.name || "N/A"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-sm text-slate-500 dark:text-slate-400">
                                Created at
                            </dt>
                            <dd className="mt-1 font-medium text-slate-900 dark:text-slate-100">
                                {bank?.created_at || "N/A"}
                            </dd>
                        </div>
                    </dl>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Show;
