import { Link, usePage, Head, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, EyeIcon, Trash2Icon } from "lucide-react";
import { dateTimeFormater } from "@/util/DateFormater";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

const Index = () => {
    const { products, company_name, filters } = usePage().props;
    const list = products?.data ?? [];
    const { setData, delete: destroy } = useForm({ id: null });

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this product?")) {
            setData("id", id);
            destroy(route("products.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout title="Products">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                Product Module
                            </p>
                            <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Browse and manage your products
                            </h3>
                            {/* <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Manage your product catalog here, then set stock and pricing from the dedicated Product prices workspace.
                            </p> */}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Visible products: <span className="font-semibold text-slate-900 dark:text-slate-100">{list.length}</span>
                                </p>
                                {/* <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100 text-center">
                                    {list.length}
                                </p> */}
                            </div>
                            <Link
                                href={route("products.create")}
                                className="create-button"
                            >
                                Add Product
                            </Link>
                        </div>
                    </div>
                </div>
                <IndexFilters
                    routeName="products.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search products..."
                    className="mb-4"
                />

                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    {list.length > 0 ? (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">
                                        SI
                                    </th>
                                    <th className="custom-th">
                                        Image
                                    </th>
                                    {/* <th className="custom-th">
                                        Category
                                    </th> */}
                                    {/* <th className="custom-th">
                                        Attribute
                                    </th> */}
                                    {/* <th className="custom-th">Unit</th> */}
                                    {/* <th className="custom-th">Pricing</th> */}
                                    {/* <th className="custom-th">Stock setup</th> */}
                                    <th className="custom-th">
                                        Name
                                    </th>
                                    <th className="custom-th">Created at</th>
                                    <th className="custom-th rounded-r-md">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((product, index) => (
                                    <tr
                                        key={product.id}
                                        className="custom-body-tr"
                                    >
                                        <td className="custom-body-td">
                                            {(products.current_page - 1) * products.per_page + index + 1}
                                        </td>
                                        <td>
                                            {product.product_image_url ? (
                                                <img
                                                    src={product.product_image_url}
                                                    alt={product.name}
                                                    className="w-16 h-16 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="flex h-16 w-16 items-center justify-center rounded bg-slate-100 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                                    No image
                                                </div>
                                            )}
                                        </td>
                                        {/* <td className="custom-body-td">
                                            {product.sub_category?.name || "N/A"}
                                        </td> */}
                                        {/* <td className="custom-body-td">
                                            {product.attribute?.name || "Standard"}
                                        </td>
                                        <td className="custom-body-td">
                                            {product.unit || "N/A"}
                                        </td>
                                        <td className="custom-body-td">
                                            {product.variants?.length ? "Configured" : "Pending"}
                                        </td>
                                        <td className="custom-body-td">
                                            {product.variants?.length ? "Configured" : "Pending"}
                                        </td> */}
                                        <td className="custom-body-td">
                                            {product.name}
                                        </td>
                                        <td className="custom-body-td">
                                            {dateTimeFormater(product.created_at)}
                                        </td>
                                        <td className="custom-body-td text-center flex items-center gap-2">
                                            <Link
                                                href={route(
                                                    "products.show",
                                                    product.id
                                                )}
                                                className="show-button"
                                            >
                                                <EyeIcon className="w-4 h-4 inline" />
                                            </Link>
                                            {/* <Link
                                                href={route(
                                                    product.variants?.length
                                                        ? "product-prices.edit"
                                                        : "product-prices.create",
                                                    product.variants?.length
                                                        ? product.id
                                                        : { product: product.id }
                                                )}
                                                className="show-button"
                                            >
                                                Price
                                            </Link> */}
                                            <Link
                                                href={route(
                                                    "products.edit",
                                                    product.id
                                                )}
                                                className="edit-button"
                                            >
                                                <EditIcon className="w-4 h-4 inline" />
                                            </Link>
                                            <button
                                                onClick={() =>
                                                    handleDelete(product.id)
                                                }
                                                className="delete-button"
                                            >
                                                <Trash2Icon className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <NoDataFound />
                    )}
                </div>
                <Pagination links={products?.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
