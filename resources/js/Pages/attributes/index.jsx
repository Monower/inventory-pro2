import { Link, usePage, useForm, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, Trash2Icon } from "lucide-react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

const Index = () => {
    const { attributes, company_name, filters } = usePage().props;
    const { delete: destroy, processing } = useForm();
    const list = attributes?.data ?? [];

    // ---- Delete handler ----
    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this attribute?")) {
            destroy(route("attributes.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Attributes - ${company_name}`} />
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="heading">Attributes</h3>
                    <Link
                        href={route("attributes.create")}
                        className="create-button"
                    >
                        Create
                    </Link>
                </div>
                <IndexFilters
                    routeName="attributes.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search attributes..."
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
                                    <th className="custom-th">Values</th>
                                    <th className="custom-th rounded-r-md">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((attr, index) => (
                                    <tr key={attr.id} className="custom-body-tr">
                                        <td className="custom-body-td">
                                            {(attributes.current_page - 1) * attributes.per_page + index + 1}
                                        </td>
                                        <td className="custom-body-td">
                                            {attr.name}
                                        </td>
                                        <td className="custom-body-td">
                                            {attr.values?.map((v) => v.name).join(", ")}
                                        </td>
                                        <td className="custom-body-td text-center flex items-center gap-2">
                                            <Link
                                                href={route("attributes.edit", attr.id)}
                                                className="edit-button"
                                            >
                                                <EditIcon className="w-4 h-4 inline" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(attr.id)}
                                                disabled={processing}
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
                <Pagination links={attributes?.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
