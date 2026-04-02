import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Link } from "@inertiajs/react";
import { dateTimeFormater } from "@/util/DateFormater";

const Show = ({ product }) => {
    const variants = (product?.variants || []).filter(
        (variant) => variant.attribute_value_id
    );
    const simpleVariant = (product?.variants || []).find(
        (variant) => !variant.attribute_value_id
    );

    return (
        <AuthenticatedLayout title="View product">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <BackButton url={"products.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Product details: {product?.name}</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Review category, pricing, stock, attributes, and media in one place.</p>
                        </div>
                    </div>

                    <Link
                        href={route("products.edit", product.id)}
                        className="edit-button"
                    >
                        Edit product
                    </Link>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                            {product?.product_image ? (
                                <img
                                    src={`/storage/app/public/${product.product_image}`}
                                    alt={product?.name}
                                    className="w-full max-w-xs h-auto rounded-md border"
                                />
                            ) : (
                                <div className="w-full max-w-xs h-56 rounded-md border flex items-center justify-center text-sm text-gray-500">
                                    No image
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <p>
                                <strong>Name:</strong> {product?.name || "N/A"}
                            </p>
                            <p>
                                <strong>Category:</strong>{" "}
                                {product?.sub_category?.category?.name || "N/A"}
                            </p>
                            <p>
                                <strong>Sub-category:</strong>{" "}
                                {product?.sub_category?.name || "N/A"}
                            </p>
                            <p>
                                <strong>Attribute:</strong>{" "}
                                {product?.attribute_value?.attribute?.name || "N/A"}
                            </p>
                            <p>
                                <strong>Attribute value:</strong>{" "}
                                {product?.attribute_value?.name || "N/A"}
                            </p>
                            <p>
                                <strong>Buying price:</strong>{" "}
                                {product?.buying_price ?? "0"}
                            </p>
                            <p>
                                <strong>Selling price:</strong>{" "}
                                {product?.selling_price ?? "0"}
                            </p>
                            <p>
                                <strong>Total stock:</strong> {product?.stock ?? 0} {product?.unit || ""}
                            </p>
                            {simpleVariant && (
                                <p>
                                    <strong>Base stock:</strong> {simpleVariant.stock ?? 0} {product?.unit || ""}
                                </p>
                            )}
                            <p>
                                <strong>Description:</strong>{" "}
                                {product?.description || "N/A"}
                            </p>
                            <p>
                                <strong>Created at:</strong>{" "}
                                {dateTimeFormater(product?.created_at) || "N/A"}
                            </p>
                            <p>
                                <strong>Updated at:</strong>{" "}
                                {dateTimeFormater(product?.updated_at) || "N/A"}
                            </p>
                        </div>
                    </div>
                </div>

                {variants.length > 0 && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="mb-4">
                            <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                Stock by attribute
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Each attribute value keeps its own stock, and the product total is summed from these rows.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="custom-table">
                                <thead className="custom-thead">
                                    <tr>
                                        <th className="custom-th rounded-l-md">Attribute</th>
                                        <th className="custom-th">Value</th>
                                        <th className="custom-th rounded-r-md">Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {variants.map((variant) => (
                                        <tr key={variant.id} className="custom-body-tr">
                                            <td className="custom-body-td">
                                                {variant.attribute_value?.attribute?.name || "N/A"}
                                            </td>
                                            <td className="custom-body-td">
                                                {variant.attribute_value?.name || "N/A"}
                                            </td>
                                            <td className="custom-body-td">
                                                {variant.stock} {product?.unit || ""}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
};

export default Show;
