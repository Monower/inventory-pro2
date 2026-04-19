import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { useForm } from "@inertiajs/react";
import { useEffect, useMemo, useState } from "react";

const ProductPricesCreate = ({ products, selectedProductId }) => {
    const initialProductId =
        selectedProductId && products.some((product) => Number(product.id) === Number(selectedProductId))
            ? String(selectedProductId)
            : products[0]?.id
              ? String(products[0].id)
              : "";

    const { data, setData, post, errors, processing } = useForm({
        product_id: initialProductId,
        buying_price: "",
        selling_price: "",
        stock: "",
        attribute_stocks: [],
    });
    const [clientError, setClientError] = useState("");

    const selectedProduct = useMemo(
        () => products.find((product) => String(product.id) === String(data.product_id)),
        [products, data.product_id]
    );

    const hasAttribute = Boolean(selectedProduct?.attribute_id);

    useEffect(() => {
        if (!selectedProduct) {
            setData("attribute_stocks", []);
            return;
        }

        setData("attribute_stocks", []);
    }, [selectedProduct]);

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

        if (!data.product_id) {
            setClientError("Select a product first.");
            return;
        }

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
        post(route("product-prices.store"));
    };

    return (
        <AuthenticatedLayout title="Add product prices">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"product-prices.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Add product prices</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Choose a catalog product and configure its selling price, buying price, and stock.
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
                    {products.length === 0 ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            All products already have pricing configured. Use Product prices edit instead.
                        </p>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2 after:content-['*'] after:ml-0.5 after:text-red-500">
                                    Product
                                </legend>
                                <select
                                    value={data.product_id}
                                    onChange={(event) => setData("product_id", event.target.value)}
                                    className="custom-input"
                                >
                                    {products.map((product) => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.product_id && <p className="text-red-500 text-xs">{errors.product_id}</p>}
                            </fieldset>

                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
                                <p><strong>Category:</strong> {selectedProduct?.sub_category?.name || "N/A"}</p>
                                <p><strong>Attribute:</strong> {selectedProduct?.attribute?.name || "Standard"}</p>
                                <p><strong>Unit:</strong> {selectedProduct?.unit || "N/A"}</p>
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
                                            Select only the attribute values this product actually has.
                                        </p>
                                    </div>

                                    {selectedProduct?.attribute?.values?.map((value) => {
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
                                                    {value?.name || value?.value}
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
                                    Save prices
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default ProductPricesCreate;
