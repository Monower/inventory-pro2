import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage } from "@inertiajs/react";

const Index = ({ roles }) => {
    // const { auth } = usePage().props;
    // const canCreateStaff = auth?.user?.permissions.includes("create staff");
    const {
        data,
        setData,
        post,
        processing,
        errors,
        delete: destroy,
    } = useForm({
        id: null,
    });

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this role?")) {
            setData("id", id);
            destroy(route("role.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout>
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Roles</h3>

                    <Link
                        href="/roles/create"
                        className="bg-blue-500 text-white p-1 px-2 rounded"
                    >
                        Create
                    </Link>
                </div>

                <div className="bg-white p-4 rounded">
                    <table className="w-full text-left border-collapse border">
                        <thead className="border-b">
                            <tr className="[&>th]:border [&>th]:py-1 [&>th]:px-2">
                                <th>SI</th>
                                <th>Role name</th>
                                <th className="w-[40vw]">Permissions</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {roles.map((role, index) => (
                                <tr
                                    key={index}
                                    className="[&>td]:border [&>td]:py-1 [&>td]:px-2"
                                >
                                    <td>{index + 1}</td>
                                    <td>{role.name}</td>
                                    <td>
                                        <div className="flex flex-wrap gap-2">
                                            {role?.permissions?.map(
                                                (item, index) => {
                                                    return (
                                                        <span
                                                            key={index}
                                                            className="bg-green-700 text-white py-1 px-2 rounded"
                                                        >
                                                            {item.name}
                                                        </span>
                                                    );
                                                }
                                            )}

                                            {/* {
                                                role?.permissions?.length > 4 && <span className="bg-green-400 text-white py-1 px-2 rounded">...</span>
                                            } */}
                                        </div>
                                    </td>
                                    <td>
                                        {role?.name !== "admin" && (
                                            <>
                                                <Link
                                                    href={route(
                                                        "role.edit",
                                                        role.id
                                                    )}
                                                    className="bg-blue-500 text-white py-1 px-2 rounded mr-2"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(role.id)
                                                    }
                                                    className="bg-red-500 text-white py-1 px-2 rounded"
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
