import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { useForm } from "@inertiajs/react";
import { useMemo, useState } from "react";

const ProductPricesEdit = ({ product }) => {
    const [clientError, setClientError] = useState("");
    const variants = product.variants || [];
    const hasAttribute = Boolean(product.attribute_id);
    const baseVariant = variants.find((variant) => !variant.attribute_value_id);

    const { data, setData, put, errors, processing } = useForm({
        buying_price: baseVariant?.buying_price ?? "",
        selling_price: baseVariant?.selling_price ?? "",
        stock: baseVariant?.stock ?? "",
        attribute_stocks: variants
            .filter((variant) => variant.attribute_value_id)
            .map((variant) => ({
                attribute_value_id: String(variant.attribute_value_id),
                buying_price: variant.buying_price ?? "",
                selling_price: variant.selling_price ?? "",
                stock: variant.stock ?? "",
            })),
    });

    const attributeValues = useMemo(() => product.attribute?.values || [], [product.attribute]);

    const toggleVariantValue = (valueId, checked) => {
        if (!checked) {
            setData(
                "attribute_stocks",
                data.attribute_stocks.filter((item) => String(item.attribute_value_id) !== String(valueId))
            );
            return;
        }

        if (data.attribute_stocks.some((item) => String(item.attribute_value_id) === String(valueId))) {
            return;
        }

        setData("attribute_stocks", [
            ...data.attribute_stocks,
            {
                attribute_value_id: String(valueId),
                buying_price: "",
                selling_price: "",
                stock: "",
            },
        ]);
    };

    const updateVariantField = (valueId, field, value) => {
        const exists = data.attribute_stocks.some((item) => String(item.attribute_value_id) === String(valueId));

        if (!exists) {
            setData("attribute_stocks", [
                ...data.attribute_stocks,
                {
                    attribute_value_id: String(valueId),
                    buying_price: field === "buying_price" ? value : "",
                    selling_price: field === "selling_price" ? value : "",
                    stock: field === "stock" ? value : "",
                },
            ]);
            return;
        }

        setData(
            "attribute_stocks",
            data.attribute_stocks.map((item) =>
                String(item.attribute_value_id) === String(valueId)
                    ? { ...item, [field]: value }
                    : item
            )
        );
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (hasAttribute && data.attribute_stocks.length === 0) {
            setClientError("Select at least one attribute value for this product.");
            return;
        }

        if (
            hasAttribute &&
            data.attribute_stocks.some(
                (item) => item.buying_price === "" || item.selling_price === "" || item.stock === ""
            )
        ) {
            setClientError("Fill in buying price, selling price, and stock for each selected attribute value.");
            return;
        }

        if (!hasAttribute && (data.buying_price === "" || data.selling_price === "" || data.stock === "")) {
            setClientError("Fill in buying price, selling price, and stock.");
            return;
        }

        setClientError("");
        put(route("product-prices.update", product.id));
    };

    return (
        <AuthenticatedLayout title="Edit product prices">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"product-prices.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Edit product prices</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Update prices and stock for {product.name}.
                            </p>
                        </div>
                    </div>
                </div>

                {clientError && (
                    <p className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                        {clientError}
                    </p>
                )}

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                            <p><strong>Product:</strong> {product.name}</p>
                            <p><strong>Attribute:</strong> {product.attribute?.name || "Standard"}</p>
                            <p><strong>Unit:</strong> {product.unit || "N/A"}</p>
                        </div>

                        {!hasAttribute && (
                            <div className="grid gap-4 lg:grid-cols-3">
                                <input type="number" min="0" step="0.01" value={data.buying_price} onChange={(event) => setData("buying_price", event.target.value)} className="custom-input" placeholder="Buying price" />
                                <input type="number" min="0" step="0.01" value={data.selling_price} onChange={(event) => setData("selling_price", event.target.value)} className="custom-input" placeholder="Selling price" />
                                <input type="number" min="0" value={data.stock} onChange={(event) => setData("stock", event.target.value)} className="custom-input" placeholder="Stock" />
                            </div>
                        )}

                        {hasAttribute && (
                            <div className="space-y-3">
                                <div>
                                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Variant pricing</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Keep checked only the attribute values this product actually has.
                                    </p>
                                </div>

                                {attributeValues.map((value) => {
                                    const row = data.attribute_stocks.find(
                                        (item) => String(item.attribute_value_id) === String(value.id)
                                    );
                                    const selected = Boolean(row);

                                    return (
                                        <div
                                            key={value.id}
                                            className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-[1fr_160px_160px_160px_160px] dark:border-slate-700 dark:bg-slate-800/60"
                                        >
                                            <label className="flex items-center gap-2 font-medium text-slate-900 dark:text-slate-100">
                                                <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={(event) => toggleVariantValue(value.id, event.target.checked)}
                                                />
                                                {value.name || value.value}
                                            </label>
                                            <input type="number" min="0" step="0.01" disabled={!selected} value={row?.buying_price ?? ""} onChange={(event) => updateVariantField(value.id, "buying_price", event.target.value)} className="custom-input disabled:cursor-not-allowed disabled:opacity-50" placeholder="Buying price" />
                                            <input type="number" min="0" step="0.01" disabled={!selected} value={row?.selling_price ?? ""} onChange={(event) => updateVariantField(value.id, "selling_price", event.target.value)} className="custom-input disabled:cursor-not-allowed disabled:opacity-50" placeholder="Selling price" />
                                            <input type="number" min="0" disabled={!selected} value={row?.stock ?? ""} onChange={(event) => updateVariantField(value.id, "stock", event.target.value)} className="custom-input disabled:cursor-not-allowed disabled:opacity-50" placeholder="Stock" />
                                        </div>
                                    );
                                })}
                                {errors.attribute_stocks && <p className="text-red-500 text-xs">{errors.attribute_stocks}</p>}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button type="submit" disabled={processing} className="create-button">
                                Update prices
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default ProductPricesEdit;
