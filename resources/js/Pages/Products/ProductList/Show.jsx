import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";

const emptyValue = "-";

const fieldClass =
    "rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-950/40";

function StatusBadge({ status }) {
    const isActive = status === "Active";

    return (
        <span
            className={
                "inline-flex rounded-full px-3 py-1 text-xs font-semibold " +
                (isActive
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300")
            }
        >
            {status}
        </span>
    );
}

function DetailField({ label, value }) {
    return (
        <div className={fieldClass}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {label}
            </p>
            <p className="mt-2 break-words text-sm font-semibold text-slate-900 dark:text-slate-100">
                {value || emptyValue}
            </p>
        </div>
    );
}

function Card({ title, children }) {
    return (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                {title}
            </h2>
            <div className="mt-5">{children}</div>
        </section>
    );
}

function VariantsTable({ variants = [] }) {
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-950/40">
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                        <th className="px-3 py-3">Variant Name</th>
                        <th className="px-3 py-3">SKU</th>
                        <th className="px-3 py-3">Price</th>
                        <th className="px-3 py-3">Cost Price</th>
                        <th className="px-3 py-3">Stock</th>
                        <th className="px-3 py-3">Barcode</th>
                        <th className="px-3 py-3">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {variants.map((variant) => (
                        <tr key={variant.id}>
                            <td className="px-3 py-3 text-sm font-semibold text-slate-900 dark:text-slate-100">
                                {variant.variant_name || emptyValue}
                            </td>
                            <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
                                {variant.sku || emptyValue}
                            </td>
                            <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
                                {variant.price}
                            </td>
                            <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
                                {variant.cost_price}
                            </td>
                            <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
                                {variant.stock}
                            </td>
                            <td className="px-3 py-3 text-sm text-slate-600 dark:text-slate-300">
                                {variant.barcode || emptyValue}
                            </td>
                            <td className="px-3 py-3">
                                <StatusBadge status={variant.status} />
                            </td>
                        </tr>
                    ))}
                    {variants.length === 0 && (
                        <tr>
                            <td
                                colSpan={7}
                                className="px-3 py-6 text-sm text-slate-500 dark:text-slate-400"
                            >
                                No variants added yet.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default function Show({ product }) {
    const additionalImages = product.additional_images || [];

    return (
        <AuthenticatedLayout title={product.name}>
            <Head title={product.name} />

            <section className="space-y-6">
                <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                            {product.name}
                        </h1>
                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                            <Link
                                href="/dashboard"
                                className="font-medium text-slate-700 hover:text-amber-700 dark:text-slate-200 dark:hover:text-amber-300"
                            >
                                Dashboard
                            </Link>
                            <span>&gt;</span>
                            <Link
                                href="/products"
                                className="font-medium text-slate-700 hover:text-amber-700 dark:text-slate-200 dark:hover:text-amber-300"
                            >
                                Products
                            </Link>
                            <span>&gt;</span>
                            <span>{product.name}</span>
                        </div>
                    </div>
                    <Link
                        href={`/products/${product.id}/edit`}
                        className="create-button px-5 py-2 text-center"
                    >
                        Edit Product
                    </Link>
                </div>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="space-y-6">
                        <Card title="Basic Info">
                            <div className="grid gap-4 md:grid-cols-2">
                                <DetailField label="Name" value={product.name} />
                                <DetailField label="Slug" value={product.slug} />
                                <DetailField label="Unit" value={product.unit} />
                                <div className={`${fieldClass} md:col-span-2`}>
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                        Description
                                    </p>
                                    <p className="mt-2 whitespace-pre-line text-sm text-slate-700 dark:text-slate-300">
                                        {product.description || emptyValue}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card title="Pricing">
                            <div className="grid gap-4 md:grid-cols-3">
                                <DetailField
                                    label="Base Price"
                                    value={product.base_price}
                                />
                                <DetailField
                                    label="Cost Price"
                                    value={product.cost_price}
                                />
                                <DetailField label="VAT" value={`${product.vat}%`} />
                            </div>
                        </Card>

                        <Card title="Variants">
                            <VariantsTable variants={product.variants || []} />
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card title="Status">
                            <StatusBadge status={product.status} />
                        </Card>

                        <Card title="Category">
                            <div className="space-y-4">
                                <DetailField label="Category" value={product.category} />
                                <DetailField
                                    label="Sub Category"
                                    value={product.sub_category}
                                />
                            </div>
                        </Card>

                        <Card title="Image">
                            <div className="space-y-5">
                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Primary Image
                                    </p>
                                    {product.image_url ? (
                                        <img
                                            src={product.image_url}
                                            alt={product.name}
                                            className="mt-2 h-52 w-full rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="mt-2 flex h-52 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                            No image
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        Additional Images
                                    </p>
                                    {additionalImages.length > 0 ? (
                                        <div className="mt-2 grid grid-cols-3 gap-2">
                                            {additionalImages.map((image, index) => (
                                                <img
                                                    key={image.id}
                                                    src={image.image_url}
                                                    alt={`${product.name} gallery ${index + 1}`}
                                                    className="h-24 rounded-lg object-cover"
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="mt-2 rounded-xl bg-slate-100 p-4 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                            No additional images
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
