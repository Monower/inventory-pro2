import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm, usePage } from "@inertiajs/react";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, EyeIcon, Trash2Icon } from "lucide-react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";
import ListPageLayout from "@/Components/List/ListPageLayout";

const Index = ({ suppliers }) => {
    const { filters } = usePage().props;
    const list = suppliers?.data ?? [];
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this supplier?")) {
            destroy(route("suppliers.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout title="Suppliers">
            <ListPageLayout
                title="Suppliers"
                description="Keep supplier records organized with faster access to contacts, purchasing context, and vendor maintenance actions."
                actions={
                    <Link href={route("suppliers.create")} className="create-button">
                        Create Supplier
                    </Link>
                }
                stats={[
                    { label: "Visible suppliers", value: `${list.length}` },
                    { label: "Total suppliers", value: `${suppliers?.total || 0}` },
                ]}
            >

                <IndexFilters
                    routeName="suppliers.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search suppliers..."
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
                                    <th className="custom-th">Purchases</th>
                                    <th className="custom-th">Total Purchase</th>
                                    <th className="custom-th">Paid</th>
                                    <th className="custom-th">Due</th>
                                    <th className="custom-th rounded-r-md">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((supplier, index) => (
                                    <tr key={supplier.id} className="custom-body-tr">
                                        <td className="custom-body-td">
                                            {(suppliers.current_page - 1) * suppliers.per_page + index + 1}
                                        </td>
                                        <td className="custom-body-td">{supplier.name}</td>
                                        <td className="custom-body-td">{supplier.phone || "N/A"}</td>
                                        <td className="custom-body-td">{supplier.purchases_count || 0}</td>
                                        <td className="custom-body-td">{Number(supplier.total_purchase_amount || 0).toFixed(2)}</td>
                                        <td className="custom-body-td">{Number(supplier.total_paid_amount || 0).toFixed(2)}</td>
                                        <td className="custom-body-td">{Number(supplier.total_due_amount || 0).toFixed(2)}</td>
                                        <td className="custom-body-td flex items-center gap-2 text-center">
                                            <Link href={route("suppliers.show", supplier.id)} className="edit-button">
                                                <EyeIcon className="inline h-4 w-4" />
                                            </Link>
                                            <Link href={route("suppliers.edit", supplier.id)} className="edit-button">
                                                <EditIcon className="inline h-4 w-4" />
                                            </Link>
                                            <button onClick={() => handleDelete(supplier.id)} className="delete-button">
                                                <Trash2Icon className="inline h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <Pagination links={suppliers?.links} />
            </ListPageLayout>
        </AuthenticatedLayout>
    );
};

export default Index;
