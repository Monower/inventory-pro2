import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage } from "@inertiajs/react";

const Index = ({ roles }) => {
    /* const { auth } = usePage().props;
    const canCreateStaff = auth?.user?.permissions.includes("create staff");
    const {
        data,
        setData,
        post,
        processing,
        errors,
        delete: destroy,
    } = useForm({
        id: null,
    }); */

    /* const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this customer?")) {
            setData("id", id);
            destroy(route("staff.destroy", id));
        }
    };

    console.log("can create staff: ", canCreateStaff); */

    console.log("roles: ", roles);

    return (
        <AuthenticatedLayout>
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Roles</h3>

                    <Link
                        href="/role/create"
                        className="bg-blue-500 text-white p-1 px-2 rounded"
                    >
                        Create
                    </Link>
                </div>

                <div className="bg-white p-4 rounded">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr>
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
                                    className="text-center bg-gray-50"
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
                                        <Link
                                            href={route("role.edit", role.id)}
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
