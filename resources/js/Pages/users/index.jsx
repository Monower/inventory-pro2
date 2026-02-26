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
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Users</h3>

                    <Link
                        href="/user/create"
                        className="create-button"
                    >
                        Create
                    </Link>
                </div>
                <IndexFilters
                    routeName="users.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search users..."
                    className="mb-4"
                />

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
                <Pagination links={users?.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
