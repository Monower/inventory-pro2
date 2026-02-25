import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage, Head } from "@inertiajs/react";
import DataTable from "@/Components/DataTable/DataTable";

const Index = ({ roles }) => {
    const { company_name } = usePage().props;
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
    const tableData = roles.map((role, index) => ({
        ...role,
        si: index + 1,
        permissions: role.permissions.map((p) => p.name).join(", "),
        id: role.id,
    }));

    return (
        <AuthenticatedLayout>
            <Head title={`Roles - ${company_name}`} />
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Roles</h3>

                    <Link
                        href="/roles/create"
                        className="create-button"
                    >
                        Create
                    </Link>
                </div>

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
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
