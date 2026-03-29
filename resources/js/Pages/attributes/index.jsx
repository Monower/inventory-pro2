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
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                Attribute Module
                            </p>
                            <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Define product variations clearly
                            </h3>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Manage attributes and their values so products stay
                                consistent across your catalog.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Visible attributes</p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{list.length}</p>
                            </div>
                            <Link
                                href={route("attributes.create")}
                                className="create-button"
                            >
                                Create
                            </Link>
                        </div>
                    </div>
                </div>
                <IndexFilters
                    routeName="attributes.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search attributes..."
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
