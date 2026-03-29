import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage, Head } from "@inertiajs/react";
import DataTable from "@/Components/DataTable/DataTable";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

const Index = ({ users }) => {
    const { company_name, filters } = usePage().props;
    const list = users?.data ?? [];
    const { setData, delete: destroy, processing } = useForm({ id: null });

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this user?")) {
            setData("id", id);
            destroy(route("user.destroy", id));
        }
    };

    // ---- Columns for DataTable ----
    const columns = [
        { key: "si", label: "SI" },
        { key: "avatar", label: "Avatar" },
        { key: "name", label: "Name" },
        { key: "email", label: "Email" },
        { key: "phone", label: "Phone" },
        { key: "roles", label: "Role" },
    ];

    // ---- Format data for DataTable ----
    const tableData = list.map((user, index) => ({
        ...user,
        si: (users.current_page - 1) * users.per_page + index + 1,
        avatar: user.avatar ? (
            <img
                src={"/storage/" + user.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full"
            />
        ) : (
            "N/A"
        ),
        roles: user.roles.map((role, i) => (
            <span
                key={i}
                className="bg-green-700 text-white py-1 px-2 rounded mr-1 mb-1 inline-block"
            >
                {role.name}
            </span>
        )),
        id: user.id,
    }));

    return (
        <AuthenticatedLayout>
            <Head title={`Users - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                User Module
                            </p>
                            <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Manage user accounts and assigned roles
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Review users, confirm role assignment, and keep
                                account access tidy from one place.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Visible users
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {list.length}
                                </p>
                            </div>
                            <Link
                                href="/user/create"
                                className="create-button"
                            >
                                Create
                            </Link>
                        </div>
                    </div>
                </div>
                <IndexFilters
                    routeName="users.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search users..."
                    className="mb-4"
                />

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <DataTable
                        columns={columns}
                        data={tableData}
                        actions={(row) => (
                            <div className="flex gap-2">
                                <Link
                                    href={route("user.edit", row.id)}
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
                        )}
                        noDataMessage="No users found."
                    />
                </div>
                <Pagination links={users?.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
