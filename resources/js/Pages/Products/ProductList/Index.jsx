import Pagination from "@/Components/Pagination";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm } from "@inertiajs/react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useMemo, useState } from "react";

const statusClass = {
    Active: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
    Inactive: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const actionButtonClass =
    "rounded-lg border px-3 py-1.5 text-xs font-semibold transition";

function StatusBadge({ status }) {
    return (
        <span
            className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${
                statusClass[status] || statusClass.Inactive
            }`}
        >
            {status}
        </span>
    );
}

function VariantsTable({ variants }) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                    <thead>
                        <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                            <th className="px-4 py-3">Variant Name</th>
                            <th className="px-4 py-3">SKU</th>
                            <th className="px-4 py-3">Price</th>
                            <th className="px-4 py-3">Stock</th>
                            <th className="px-4 py-3">Barcode</th>
                            <th className="px-4 py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                        {variants.map((variant) => (
                            <tr key={variant.id}>
                                <td className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                    {variant.variant_name}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                                    {variant.sku || "-"}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                    {variant.price}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                    {variant.stock}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                                    {variant.barcode || "-"}
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={variant.status} />
                                </td>
                            </tr>
                        ))}
                        {variants.length === 0 && (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="px-4 py-5 text-sm text-slate-500 dark:text-slate-400"
                                >
                                    No variants added yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function Index({ products, categories = [], units = [], filters = {} }) {
    const rows = products?.data || [];
    const [filterData, setFilterData] = useState({
        q: filters.q || "",
        category_id: filters.category_id || "",
        sub_category_id: filters.sub_category_id || "",
        status: filters.status || "all",
    });
    const [expandedRows, setExpandedRows] = useState(() =>
        rows[0]?.id ? new Set([rows[0].id]) : new Set()
    );
    const { delete: destroy, processing } = useForm();

    const selectedCategory = useMemo(
        () =>
            categories.find(
                (category) => String(category.id) === String(filterData.category_id)
            ),
        [categories, filterData.category_id]
    );
    const subCategoryOptions = selectedCategory?.sub_categories || [];

    const setFilter = (key, value) => {
        setFilterData((current) => ({
            ...current,
            [key]: value,
            ...(key === "category_id" ? { sub_category_id: "" } : {}),
        }));
    };

    const applyFilters = (event) => {
        event.preventDefault();

        router.get("/products", filterData, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const resetFilters = () => {
        router.get(
            "/products",
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const toggleExpanded = (productId) => {
        setExpandedRows((current) => {
            const next = new Set(current);

            if (next.has(productId)) {
                next.delete(productId);
            } else {
                next.add(productId);
            }

            return next;
        });
    };

    const deleteProduct = (product) => {
        if (confirm(`Delete ${product.name}?`)) {
            destroy(`/products/${product.id}`, {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout title="Products">
            <Head title="Products" />

            <section className="space-y-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                        Products
                    </h1>
                    <Link href="/products/create" className="create-button px-5 py-2">
                        Add Product
                    </Link>
                </div>

                <form
                    onSubmit={applyFilters}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto] xl:items-end">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Search
                            </label>
                            <input
                                type="text"
                                value={filterData.q}
                                onChange={(event) => setFilter("q", event.target.value)}
                                className="mt-1"
                                placeholder="Search products, SKU, barcode"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Category
                            </label>
                            <select
                                value={filterData.category_id}
                                onChange={(event) =>
                                    setFilter("category_id", event.target.value)
                                }
                                className="mt-1"
                            >
                                <option value="">All categories</option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Sub Category
                            </label>
                            <select
                                value={filterData.sub_category_id}
                                onChange={(event) =>
                                    setFilter("sub_category_id", event.target.value)
                                }
                                className="mt-1"
                                disabled={!filterData.category_id}
                            >
                                <option value="">All sub categories</option>
                                {subCategoryOptions.map((subCategory) => (
                                    <option key={subCategory.id} value={subCategory.id}>
                                        {subCategory.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Status
                            </label>
                            <select
                                value={filterData.status}
                                onChange={(event) =>
                                    setFilter("status", event.target.value)
                                }
                                className="mt-1"
                            >
                                <option value="all">All</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button type="submit" className="create-button px-5 py-2">
                                Filter
                            </button>
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </form>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-950/40">
                                <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                    <th className="px-5 py-4">#</th>
                                    <th className="px-5 py-4">Image</th>
                                    <th className="px-5 py-4">Name</th>
                                    <th className="px-5 py-4">Category</th>
                                    <th className="px-5 py-4">Sub Category</th>
                                    <th className="px-5 py-4">Unit</th>
                                    <th className="px-5 py-4">Base Price</th>
                                    <th className="px-5 py-4">Variants Count</th>
                                    <th className="px-5 py-4">Status</th>
                                    <th className="px-5 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                {rows.map((product, index) => {
                                    const isExpanded = expandedRows.has(product.id);

                                    return (
                                        <Fragment key={product.id}>
                                            <tr className="align-top">
                                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                    {index + 1}
                                                </td>
                                                <td className="px-5 py-4">
                                                    {product.image_url ? (
                                                        <img
                                                            src={product.image_url}
                                                            alt={product.name}
                                                            className="h-12 w-12 rounded-lg object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-xs text-slate-400 dark:bg-slate-800">
                                                            No image
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleExpanded(product.id)}
                                                        className="flex items-center gap-2 text-left text-sm font-semibold text-slate-900 dark:text-slate-100"
                                                    >
                                                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                                                            {isExpanded ? (
                                                                <ChevronDown className="h-4 w-4" />
                                                            ) : (
                                                                <ChevronRight className="h-4 w-4" />
                                                            )}
                                                        </span>
                                                        {product.name}
                                                    </button>
                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {product.slug}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                    {product.category || "-"}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                    {product.sub_category || "-"}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                    {product.unit || "-"}
                                                </td>
                                                <td className="px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                                    {product.base_price}
                                                </td>
                                                <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-300">
                                                    {product.variants_count}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <StatusBadge status={product.status} />
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex flex-wrap justify-end gap-2">
                                                        <Link
                                                            href={`/products/${product.id}`}
                                                            className={`${actionButtonClass} border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800`}
                                                        >
                                                            View
                                                        </Link>
                                                        <Link
                                                            href={`/products/${product.id}/edit`}
                                                            className={`${actionButtonClass} border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300`}
                                                        >
                                                            Edit
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            disabled={processing}
                                                            onClick={() => deleteProduct(product)}
                                                            className={`${actionButtonClass} border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300`}
                                                        >
                                                            {processing ? "Deleting..." : "Delete"}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={10} className="px-5 py-4">
                                                        <VariantsTable variants={product.variants || []} />
                                                    </td>
                                                </tr>
                                            )}
                                        </Fragment>
                                    );
                                })}
                                {rows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="px-5 py-10 text-center text-sm text-slate-500 dark:text-slate-400"
                                        >
                                            No products found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={products?.links} />
            </section>
        </AuthenticatedLayout>
    );
}
