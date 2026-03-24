import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage } from "@inertiajs/react";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, Trash2Icon } from "lucide-react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";
import ListPageLayout from "@/Components/List/ListPageLayout";

const Index = ({ branches }) => {
    const { filters } = usePage().props;
    const list = branches?.data ?? [];
    const { setData, delete: destroy } = useForm({ id: null });

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this branch?")) {
            setData("id", id);
            destroy(route("branch.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout title="Branches">
            <ListPageLayout
                title="Branches"
                description="Review branch identities, status, and contact details in a more polished multi-location management view."
                actions={
                    <Link href={route("branch.create")} className="create-button">
                        Create Branch
                    </Link>
                }
                stats={[
                    { label: "Visible branches", value: `${list.length}` },
                    { label: "Total branches", value: `${branches?.total || 0}` },
                ]}
            >

                <IndexFilters
                    routeName="branches.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search branches..."
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
                                    <th className="custom-th">Code</th>
                                    <th className="custom-th">Phone</th>
                                    <th className="custom-th">Email</th>
                                    <th className="custom-th">Status</th>
                                    <th className="custom-th rounded-r-md">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((branch, index) => (
                                    <tr key={branch.id} className="custom-body-tr">
                                        <td className="custom-body-td">
                                            {(branches.current_page - 1) * branches.per_page + index + 1}
                                        </td>
                                        <td className="custom-body-td">{branch.name}</td>
                                        <td className="custom-body-td">{branch.code}</td>
                                        <td className="custom-body-td">{branch.phone || "N/A"}</td>
                                        <td className="custom-body-td">{branch.email || "N/A"}</td>
                                        <td className="custom-body-td">
                                            {branch.is_active ? "Active" : "Inactive"}
                                        </td>
                                        <td className="custom-body-td flex items-center gap-2 text-center">
                                            <Link
                                                href={route("branch.edit", branch.id)}
                                                className="edit-button"
                                            >
                                                <EditIcon className="inline h-4 w-4" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(branch.id)}
                                                className="delete-button"
                                            >
                                                <Trash2Icon className="inline h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <Pagination links={branches?.links} />
            </ListPageLayout>
        </AuthenticatedLayout>
    );
};

export default Index;
