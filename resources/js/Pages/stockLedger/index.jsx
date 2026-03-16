import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { router } from "@inertiajs/react";

const StockLedgerIndex = ({ ledgers, products, movementTypes, filters }) => {
    const updateFilters = (key, value) => {
        router.get(
            route("stock-ledgers.index"),
            { ...filters, [key]: value },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AuthenticatedLayout title="Stock Ledger">
            <section className="space-y-6">
                <div>
                    <h3 className="heading">Stock Ledger</h3>
                    <p className="text-sm text-muted-foreground">
                        Review inventory movements by product, movement type, and date.
                    </p>
                </div>

                <div className="grid gap-4 rounded-lg border border-ring bg-background p-4 shadow-md md:grid-cols-4">
                    <select
                        className="custom-input"
                        value={filters.product_id || ""}
                        onChange={(e) => updateFilters("product_id", e.target.value)}
                    >
                        <option value="">All products</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name}
                            </option>
                        ))}
                    </select>
                    <select
                        className="custom-input"
                        value={filters.movement_type || ""}
                        onChange={(e) => updateFilters("movement_type", e.target.value)}
                    >
                        <option value="">All movements</option>
                        {movementTypes.map((movementType) => (
                            <option key={movementType} value={movementType}>
                                {movementType}
                            </option>
                        ))}
                    </select>
                    <input
                        type="date"
                        className="custom-input"
                        value={filters.date_from || ""}
                        onChange={(e) => updateFilters("date_from", e.target.value)}
                    />
                    <input
                        type="date"
                        className="custom-input"
                        value={filters.date_to || ""}
                        onChange={(e) => updateFilters("date_to", e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto rounded-lg border border-ring bg-background shadow-md">
                    <table className="w-full min-w-[1100px] text-sm">
                        <thead className="custom-thead">
                            <tr>
                                <th className="custom-th rounded-l-md">Date</th>
                                <th className="custom-th">Product</th>
                                <th className="custom-th">Movement</th>
                                <th className="custom-th">Quantity change</th>
                                <th className="custom-th">Balance after</th>
                                <th className="custom-th">Source</th>
                                <th className="custom-th">User</th>
                                <th className="custom-th rounded-r-md">Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ledgers.data.length ? (
                                ledgers.data.map((entry) => (
                                    <tr key={entry.id} className="custom-body-tr">
                                        <td className="custom-body-td">
                                            {new Date(entry.created_at).toLocaleString()}
                                        </td>
                                        <td className="custom-body-td">{entry.product?.name || "N/A"}</td>
                                        <td className="custom-body-td">{entry.movement_type}</td>
                                        <td className="custom-body-td">{entry.quantity_change}</td>
                                        <td className="custom-body-td">{entry.balance_after}</td>
                                        <td className="custom-body-td">
                                            {entry.source_type
                                                ? `${entry.source_type.split("\\").pop()} #${entry.source_id}`
                                                : "Manual"}
                                        </td>
                                        <td className="custom-body-td">{entry.causer?.name || "System"}</td>
                                        <td className="custom-body-td">{entry.notes || "N/A"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="custom-body-tr">
                                    <td className="custom-body-td text-center" colSpan={8}>
                                        No stock ledger entries found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {ledgers.links?.length > 3 && (
                    <div className="flex flex-wrap gap-2">
                        {ledgers.links.map((link, index) => (
                            <button
                                key={index}
                                type="button"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                className={`rounded-md border px-3 py-2 text-sm ${
                                    link.active ? "bg-primary text-primary-foreground" : ""
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
};

export default StockLedgerIndex;
