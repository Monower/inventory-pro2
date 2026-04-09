import { Head, Link, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

const money = (value) => {
    if (value === null || value === undefined || value === "") {
        return "Not set";
    }

    return Number(value).toFixed(2);
};

const ProductPricesIndex = () => {
    const { products, filters } = usePage().props;
    const list = products?.data ?? [];

    return (
        <AuthenticatedLayout title="Product prices">
            <Head title="Product prices" />

            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                Product Prices
                            </p>
                            <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Manage product prices
                            </h3>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link href={route("product-prices.create")} className="create-button">
                                Add product prices
                            </Link>
                        </div>
                    </div>
                </div>

                <IndexFilters
                    routeName="product-prices.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search product prices..."
                    className="mb-4"
                />

                <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <table className="custom-table">
                        <thead className="custom-thead">
                            <tr>
                                <th className="custom-th rounded-l-md">SI</th>
                                <th className="custom-th">Product</th>
                                {/* <th className="custom-th">Attribute</th> */}
                                {/* <th className="custom-th">Variants</th> */}
                                <th className="custom-th">Selling price</th>
                                {/* <th className="custom-th">Buying price</th> */}
                                <th className="custom-th">Stock</th>
                                {/* <th className="custom-th">Status</th> */}
                                <th className="custom-th rounded-r-md">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((product, index) => {
                                const variants = product.variants || [];
                                const baseVariant = variants.find((variant) => !variant.attribute_value_id);
                                const hasPricing = variants.length > 0;
                                const sellingPrice = baseVariant?.selling_price ?? variants[0]?.selling_price;
                                const buyingPrice = baseVariant?.buying_price ?? variants[0]?.buying_price;

                                return (
                                    <tr key={product.id} className="custom-body-tr">
                                        <td className="custom-body-td">{index + 1}</td>
                                        <td className="custom-body-td">{product.name}</td>
                                        {/* <td className="custom-body-td">{product.attribute?.name || "Standard"}</td> */}
                                        {/* <td className="custom-body-td">{variants.length || 0}</td> */}
                                        <td className="custom-body-td">{money(sellingPrice)}</td>
                                        {/* <td className="custom-body-td">{money(buyingPrice)}</td> */}
                                        <td className="custom-body-td">
                                            {product.stock || 0} {product.unit || ""}
                                        </td>
                                        {/* <td className="custom-body-td">
                                            {hasPricing ? "Configured" : "Pending"}
                                        </td> */}
                                        <td className="custom-body-td">
                                            <Link
                                                href={
                                                    hasPricing
                                                        ? route("product-prices.edit", product.id)
                                                        : route("product-prices.create", { product: product.id })
                                                }
                                                className={hasPricing ? "edit-button" : "create-button"}
                                            >
                                                {hasPricing ? "Edit" : "Set up"}
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <Pagination links={products?.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default ProductPricesIndex;
