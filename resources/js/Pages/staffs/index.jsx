import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage } from "@inertiajs/react";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, Trash2Icon } from "lucide-react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";
import ListPageLayout from "@/Components/List/ListPageLayout";

const Index = ({ staffs }) => {
    const { auth, filters } = usePage().props;
    const list = staffs?.data ?? [];
    const canCreateStaff = auth?.user?.permissions.includes("create staff");
    const {
        setData,
        delete: destroy,
        processing
    } = useForm({
        id: null,
    });

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this employee?")) {
            setData("id", id);
            destroy(route("employee.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout title="Employees">
            <ListPageLayout
                title="Employees"
                description="Manage employee records, branch alignment, role visibility, and payroll context from one cleaner team directory."
                actions={
                    canCreateStaff ? (
                        <Link href="/employee/create" className="create-button">
                            Create Employee
                        </Link>
                    ) : null
                }
                stats={[
                    { label: "Visible employees", value: `${list.length}` },
                    { label: "Total employees", value: `${staffs?.total || 0}` },
                ]}
            >
                <IndexFilters
                    routeName="employees.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search employees..."
                    className="mb-4"
                />

                <div className="table-div">
                    {list.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">SI</th>
                                    <th className="custom-th">Name</th>
                                    <th className="custom-th">Phone</th>
                                    <th className="custom-th">Role</th>
                                    <th className="custom-th">Branch</th>
                                    <th className="custom-th">Salary</th>
                                    <th className="custom-th">Email</th>
                                    <th className="custom-th">Address</th>
                                    <th className="py-2 px-3 text-center rounded-r-md">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((staff, index) => (
                                    <tr
                                        key={index}
                                        className="custom-body-tr"
                                    >
                                        <td className="custom-body-td">{(staffs.current_page - 1) * staffs.per_page + index + 1}</td>
                                        <td className="custom-body-td">{staff?.name}</td>
                                        <td className="custom-body-td">{staff?.phone}</td>
                                        <td className="custom-body-td">{staff?.roles?.[0]?.name || "N/A"}</td>
                                        <td className="custom-body-td">{staff?.branch?.name || "Head office"}</td>
                                        <td className="custom-body-td">{staff?.salary}</td>
                                        <td className="custom-body-td">{staff?.email?.length > 0 ? staff?.email : "N/A"}</td>
                                        <td className="custom-body-td">{staff?.address?.length > 0 ? staff?.address : "N/A"}</td>
                                        <td className="custom-body-td text-center flex justify-center items-center gap-2">
                                            <Link
                                                href={route("employee.edit", staff?.id)}
                                                className="edit-button"
                                            >
                                                <EditIcon className="w-4 h-4 inline" />
                                            </Link>

                                            <button
                                                onClick={() => handleDelete(staff?.id)}
                                                className="delete-button"
                                                disabled={processing}
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
                <Pagination links={staffs?.links} />
            </ListPageLayout>
        </AuthenticatedLayout>
    );
};

export default Index;
