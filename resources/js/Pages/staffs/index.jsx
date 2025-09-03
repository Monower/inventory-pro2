import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage } from "@inertiajs/react";

const Index = ({ staffs }) => {
    const { auth } = usePage().props;
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
    });

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this customer?")) {
            setData("id", id);
            destroy(route("staff.destroy", id));
        }
    };

    console.log("can create staff: ", canCreateStaff);

    return (
        <AuthenticatedLayout>
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Staffs</h3>

                    {
                        canCreateStaff && <Link href="/staff/create" className="bg-blue-500 text-white p-1 px-2 rounded">Create</Link>
                    }
                </div>

                <div className="bg-white p-4 rounded">
                    <table className="w-full border-separate border-spacing-y-2">
                        <thead>
                            <tr>
                                <th>SI</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Salary</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffs.map((staff, index) => (
                                <tr
                                    key={index}
                                    className="text-center bg-gray-50"
                                >
                                    <td>{index + 1}</td>
                                    <td>{staff.name}</td>
                                    <td>{staff.email}</td>
                                    <td>{staff.phone}</td>
                                    <td>{staff.address}</td>
                                    <td>{staff.salary}</td>
                                    <td>
                                        <Link
                                            href={route(
                                                "staff.edit",
                                                staff.id
                                            )}
                                            className="bg-blue-500 text-white py-1 px-2 rounded mr-2"
                                        >
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() =>
                                                handleDelete(staff.id)
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
