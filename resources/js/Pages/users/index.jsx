import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage } from "@inertiajs/react";

const Index = ({ users }) => {
    const { auth } = usePage().props;
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
        if (confirm("Are you sure you want to delete this customer?")) {
            setData("id", id);
            destroy(route("user.destroy", id));
        }
    };

    console.log("users: ", users);

    return (
        <AuthenticatedLayout>
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

                <div className="bg-white p-4 rounded">
                    <table className="w-full text-left border-collapse border">
                        <thead className="border-b">
                            <tr className="[&>th]:border [&>th]:py-1 [&>th]:px-2">
                                <th>SI</th>
                                <th>Avatar</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr
                                    key={index}
                                    className="[&>td]:border [&>td]:py-1 [&>td]:px-2"
                                >
                                    <td>{index + 1}</td>
                                    <td>
                                        {
                                            user?.avatar ? (
                                                <img src={"/storage/" + user.avatar} alt="avatar" className="w-8 h-8 rounded-full" />
                                            ) : (
                                                "N/A"
                                            )
                                        }
                                    </td>
                                    {/* <td>{user.avatar ?? "N/A"}</td> */}
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.phone ?? "N/A"}</td>
                                    <td>
                                        {user?.roles?.map((role) => {
                                            return (
                                                <span
                                                    key={index}
                                                    className="bg-green-700 text-white py-1 px-2 rounded"
                                                >
                                                    {role.name}
                                                </span>
                                            );
                                        })}
                                    </td>
                                    <td>
                                        <Link
                                            href={route("user.edit", user.id)}
                                            className="bg-blue-500 text-white py-1 px-2 rounded mr-2"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(user.id)
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
