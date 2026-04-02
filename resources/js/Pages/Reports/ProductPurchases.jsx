import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Pagination from "@/Components/Pagination";
import { dateFormater } from "@/util/DateFormater";
import { router } from "@inertiajs/react";
import { useState } from "react";
import DateRangeFilters from "@/Pages/Reports/Partials/DateRangeFilters";
import ReportNav from "@/Pages/Reports/Partials/ReportNav";
import SummaryCard from "@/Pages/Reports/Partials/SummaryCard";
import { currency } from "@/Pages/Reports/Partials/format";

const ProductPurchases = ({ purchaseItems, products, filters, summary }) => {
    const [query, setQuery] = useState(filters.q || "");
    const [productId, setProductId] = useState(String(filters.product_id || ""));

    const applySecondaryFilters = (event) => {
        event.preventDefault();

        router.get(
            route("reports.purchases"),
            {
                ...filters,
                q: query || undefined,
                product_id: productId || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const exportParams = {
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
        q: filters.q || undefined,
        product_id: filters.product_id || undefined,
    };

    return (
        <AuthenticatedLayout title="Purchase Report">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                                Product Purchase Report
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Product intake and buying cost
                            </h1>
                        </div>
                        <a
                            href={route("reports.purchases.export.excel", exportParams)}
                            className="create-button text-center"
                        >
                            Export Excel
                        </a>
                    </div>
                </div>

                <ReportNav />
                <DateRangeFilters
                    routeName="reports.purchases"
                    filters={filters}
                    extra={{
                        q: filters.q || undefined,
                        product_id: filters.product_id || undefined,
                    }}
                />

                <form
                    onSubmit={applySecondaryFilters}
                    className="grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:grid-cols-3"
                >
                    <input
                        type="text"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search invoice, supplier, or product"
                        className="custom-input"
                    />
                    <select
                        value={productId}
                        onChange={(event) => setProductId(event.target.value)}
                        className="custom-input"
                    >
                        <option value="">All products</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                    <button type="submit" className="create-button">
                        Filter report
                    </button>
                </form>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <SummaryCard label="Purchase lines" value={summary.line_count} />
                    <SummaryCard label="Total quantity" value={summary.total_quantity} />
                    <SummaryCard
                        label="Purchase value"
                        value={currency(summary.total_amount)}
                    />
                    <SummaryCard
                        label="Avg buying price"
                        value={currency(summary.average_buying_price)}
                    />
                </div>

                <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-800/80">
                                <tr>
                                    {[
                                        "Date",
                                        "Invoice",
                                        "Supplier",
                                        "Product",
                                        "Qty",
                                        "Buying price",
                                        "Total",
                                    ].map((label) => (
                                        <th
                                            key={label}
                                            className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-300"
                                        >
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {purchaseItems.data.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {dateFormater(item.purchase?.purchase_date)}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                                            {item.purchase?.invoice_no}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {item.purchase?.supplier_name || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {item.product?.name || "-"}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {currency(item.buying_price)}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">
                                            {currency(item.total)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <Pagination links={purchaseItems.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default ProductPurchases;
