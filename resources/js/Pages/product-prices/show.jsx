import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Head, Link } from "@inertiajs/react";
import { dateTimeFormater } from "@/util/DateFormater";

const money = (value) => {
    if (value === null || value === undefined || value === "") {
        return "Not set";
    }

    return Number(value).toFixed(2);
};

const ProductPricesShow = ({ product }) => {
    const allVariants = product?.variants || [];
    const simpleVariant = allVariants.find((variant) => !variant.attribute_value_id);
    const attributeVariants = allVariants.filter((variant) => variant.attribute_value_id);
    const hasPricing = allVariants.length > 0;

    return (
        <AuthenticatedLayout title="View product price">
            <Head title={`Product price - ${product?.name || "View"}`} />

            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <BackButton url={"product-prices.index"} />
                            <div>
                                <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                    Product price details: {product?.name}
                                </h3>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                    Review this product&apos;s pricing setup, stock totals, and variant-level rows.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Link href={route("products.show", product.id)} className="show-button">
                                View product
                            </Link>
                            <Link
                                href={
                                    hasPricing
                                        ? route("product-prices.edit", product.id)
                                        : route("product-prices.create", { product: product.id })
                                }
                                className={hasPricing ? "edit-button" : "create-button"}
                            >
                                {hasPricing ? "Edit prices" : "Set up prices"}
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Category</p>
                            <p className="mt-1 text-base text-slate-900 dark:text-slate-100">
                                {product?.sub_category?.category?.name || "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Sub-category</p>
                            <p className="mt-1 text-base text-slate-900 dark:text-slate-100">
                                {product?.sub_category?.name || "N/A"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Attribute</p>
                            <p className="mt-1 text-base text-slate-900 dark:text-slate-100">
                                {product?.attribute?.name || "Standard"}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total stock</p>
                            <p className="mt-1 text-base text-slate-900 dark:text-slate-100">
                                {product?.stock ?? 0} {product?.unit || ""}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current buying price</p>
                            <p className="mt-1 text-base text-slate-900 dark:text-slate-100">
                                {money(product?.buying_price)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Current selling price</p>
                            <p className="mt-1 text-base text-slate-900 dark:text-slate-100">
                                {money(product?.selling_price)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Created at</p>
                            <p className="mt-1 text-base text-slate-900 dark:text-slate-100">
                                {dateTimeFormater(product?.created_at)}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Updated at</p>
                            <p className="mt-1 text-base text-slate-900 dark:text-slate-100">
                                {dateTimeFormater(product?.updated_at)}
                            </p>
                        </div>
                    </div>
                </div>

                {simpleVariant && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="mb-4">
                            <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Base price row</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                This product uses a single non-variant price configuration.
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Buying price</p>
                                <p className="mt-1 text-base text-slate-900 dark:text-slate-100">
                                    {money(simpleVariant.buying_price)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Selling price</p>
                                <p className="mt-1 text-base text-slate-900 dark:text-slate-100">
                                    {money(simpleVariant.selling_price)}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Stock</p>
                                <p className="mt-1 text-base text-slate-900 dark:text-slate-100">
                                    {simpleVariant.stock ?? 0} {product?.unit || ""}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {attributeVariants.length > 0 && (
                    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="mb-4">
                            <h4 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Variant price rows</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Each attribute value keeps separate buying price, selling price, and stock.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="custom-table">
                                <thead className="custom-thead">
                                    <tr>
                                        <th className="custom-th rounded-l-md">Attribute</th>
                                        <th className="custom-th">Value</th>
                                        <th className="custom-th">Buying price</th>
                                        <th className="custom-th">Average cost</th>
                                        <th className="custom-th">Selling price</th>
                                        <th className="custom-th rounded-r-md">Stock</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attributeVariants.map((variant) => (
                                        <tr key={variant.id} className="custom-body-tr">
                                            <td className="custom-body-td">
                                                {variant.attribute_value?.attribute?.name || "N/A"}
                                            </td>
                                            <td className="custom-body-td">{variant.attribute_value?.name || "N/A"}</td>
                                            <td className="custom-body-td">{money(variant.buying_price)}</td>
                                            <td className="custom-body-td">{money(variant.average_cost)}</td>
                                            <td className="custom-body-td">{money(variant.selling_price)}</td>
                                            <td className="custom-body-td">
                                                {variant.stock ?? 0} {product?.unit || ""}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {!hasPricing && (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
                        This product does not have any price rows yet. Use <span className="font-semibold">Set up prices</span> to add them.
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
};

export default ProductPricesShow;
