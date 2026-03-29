import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage, Head } from "@inertiajs/react";
import DataTable from "@/Components/DataTable/DataTable";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

const Index = ({ roles }) => {
    const { company_name, filters } = usePage().props;
    const list = roles?.data ?? [];
    const { setData, delete: destroy, processing } = useForm({ id: null });

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this role?")) {
            setData("id", id);
            destroy(route("role.destroy", id));
        }
    };

    // ---- Columns for DataTable ----
    const columns = [
        { key: "si", label: "SI" },
        { key: "name", label: "Role Name" },
        { key: "permissions", label: "Permissions" },
    ];

    // ---- Format data for DataTable ----
    const tableData = list.map((role, index) => ({
        ...role,
        si: (roles.current_page - 1) * roles.per_page + index + 1,
        permissions: role.permissions.map((p) => p.name).join(", "),
        id: role.id,
    }));

    return (
        <AuthenticatedLayout>
            <Head title={`Roles - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                Role Module
                            </p>
                            <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Manage access roles and permission groups
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Review each role, inspect attached permissions,
                                and keep access control organized across the app.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Visible roles
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {list.length}
                                </p>
                            </div>
                            <Link
                                href="/roles/create"
                                className="create-button"
                            >
                                Create
                            </Link>
                        </div>
                    </div>
                </div>
                <IndexFilters
                    routeName="roles.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search roles..."
                    className="mb-4"
                />

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <DataTable
                        columns={columns}
                        data={tableData}
                        actions={(row) =>
                            row.name !== "admin" && (
                                <div className="flex gap-2">
                                    <Link
                                        href={route("role.edit", row.id)}
                                        className="edit-button"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(row.id)}
                                        disabled={processing}
                                        className="delete-button"
                                    >
                                        {processing ? "Deleting..." : "Delete"}
                                    </button>
                                </div>
                            )
                        }
                        noDataMessage="No roles found."
                    />
                </div>
                <Pagination links={roles?.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
