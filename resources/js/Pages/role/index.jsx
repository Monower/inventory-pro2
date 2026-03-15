import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage } from "@inertiajs/react";
import DataTable from "@/Components/DataTable/DataTable";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

const Index = ({ roles }) => {
    const { filters } = usePage().props;
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
        <AuthenticatedLayout title="Roles">
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Roles</h3>

                    <Link
                        href="/roles/create"
                        className="create-button"
                    >
                        Create Role
                    </Link>
                </div>
                <IndexFilters
                    routeName="roles.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search roles..."
                    className="mb-4"
                />

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
                <Pagination links={roles?.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
