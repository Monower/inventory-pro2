import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage, Head } from "@inertiajs/react";
import DataTable from "@/Components/DataTable/DataTable";

const Index = ({ users }) => {
    const { company_name } = usePage().props;
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
    const tableData = users.map((user, index) => ({
        ...user,
        si: index + 1,
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
            {/* <Head title={`Create Role - ${company_name}`} /> */}
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Users</h3>

                    <Link
                        href="/user/create"
                        className="bg-blue-500 text-white p-1 px-2 rounded"
                    >
                        Create
                    </Link>
                </div>

                <DataTable
                    columns={columns}
                    data={tableData}
                    actions={(row) => (
                        <div className="flex gap-2">
                            <Link
                                href={route("user.edit", row.id)}
                                className="bg-blue-500 text-white py-1 px-2 rounded"
                            >
                                Edit
                            </Link>
                            <button
                                onClick={() => handleDelete(row.id)}
                                disabled={processing}
                                className="bg-red-500 text-white py-1 px-2 rounded"
                            >
                                {processing ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    )}
                    noDataMessage="No users found."
                />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
