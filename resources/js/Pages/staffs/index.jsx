import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage, Head } from "@inertiajs/react";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, Trash2Icon } from "lucide-react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

const Index = ({ staffs }) => {
    const { auth, company_name, filters } = usePage().props;
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
        if (confirm("Are you sure you want to delete this customer?")) {
            setData("id", id);
            destroy(route("staff.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Employees - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                Employee Module
                            </p>
                            <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Manage your employee records
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Keep salaries, contact details, and staff records
                                organized from one clean workspace.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Visible employees
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {list.length}
                                </p>
                            </div>
                            {canCreateStaff && (
                                <Link href="/staff/create" className="create-button">
                                    Create
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
                <IndexFilters
                    routeName="staffs.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search employees..."
                    className="mb-4"
                />

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    {list.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">SI</th>
                                    <th className="custom-th">Name</th>
                                    <th className="custom-th">Phone</th>
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
                                        <td className="custom-body-td">{staff?.salary}</td>
                                        <td className="custom-body-td">{staff?.email?.length > 0 ? staff?.email : "N/A"}</td>
                                        <td className="custom-body-td">{staff?.address?.length > 0 ? staff?.address : "N/A"}</td>
                                        <td className="custom-body-td text-center flex justify-center items-center gap-2">
                                            <Link
                                                href={route(
                                                    "staff.edit",
                                                    staff?.id
                                                )}
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
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
