import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage } from "@inertiajs/react";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, Trash2Icon } from "lucide-react";

const Index = ({ staffs }) => {
    const { auth } = usePage().props;
    const canCreateStaff = auth?.user?.permissions.includes("create staff");
    const {
        setData,
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

    return (
        <AuthenticatedLayout>
            <section className="px-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="heading">Employees</h3>

                    {canCreateStaff && (
                        <Link href="/staff/create" className="create-button">
                            Create
                        </Link>
                    )}
                </div>

                <div className="table-div">
                    {staffs?.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">SI</th>
                                    <th className="custom-th">Name</th>
                                    <th className="custom-th">Email</th>
                                    <th className="custom-th">Phone</th>
                                    <th className="custom-th">Address</th>
                                    <th className="custom-th">Salary</th>
                                    <th className="py-2 px-3 text-center rounded-r-md">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffs.map((staff, index) => (
                                    <tr
                                        key={index}
                                        className="custom-body-tr"
                                    >
                                        <td className="custom-body-td">{index + 1}</td>
                                        <td className="custom-body-td">{staff.name}</td>
                                        <td className="custom-body-td">{staff.email}</td>
                                        <td className="custom-body-td">{staff.phone}</td>
                                        <td className="custom-body-td">{staff.address}</td>
                                        <td className="custom-body-td">{staff.salary}</td>
                                        <td className="custom-body-td text-center flex justify-center items-center gap-2">
                                            <Link
                                                href={route(
                                                    "staff.edit",
                                                    staff.id
                                                )}
                                                className="edit-button"
                                            >
                                                <EditIcon className="w-4 h-4 inline" />
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(staff.id)}
                                                className="delete-button"
                                            >
                                                <Trash2Icon className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
