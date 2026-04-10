import React, { useState, useMemo } from "react";
import { router, usePage, Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";

const getVariantName = (variant) => variant?.attribute_value?.name || "";

const buildProductRows = (products = []) =>
    products.map((product) => {
        const variants = product.variants || [];
        const attributedVariants = variants.filter(
            (variant) => variant.attribute_value_id
        );
        const simpleVariant = variants.find((variant) => !variant.attribute_value_id);

        return {
            id: product.id,
            name: product.name,
            buying_price: Number(product.buying_price || 0),
            has_attributes: attributedVariants.length > 0,
            stock: attributedVariants.length
                ? attributedVariants.reduce(
                      (sum, variant) => sum + Number(variant.stock || 0),
                      0
                  )
                : Number(simpleVariant?.stock ?? product.stock ?? 0),
            unit: product.unit,
            variants: attributedVariants.map((variant) => ({
                line_key: `variant-${variant.id}`,
                product_id: product.id,
                product_variant_id: variant.id,
                name: product.name,
                variant_name: getVariantName(variant),
                display_name: `${product.name} - ${getVariantName(variant)}`,
                buying_price:
                    variant.buying_price !== null && variant.buying_price !== undefined
                        ? String(variant.buying_price)
                        : "",
                stock: Number(variant.stock || 0),
                unit: product.unit,
                quantity: 1,
            })),
            simple_option: {
                line_key: simpleVariant
                    ? `variant-${simpleVariant.id}`
                    : `product-${product.id}`,
                product_id: product.id,
                product_variant_id: simpleVariant?.id || null,
                name: product.name,
                variant_name: "",
                display_name: product.name,
                buying_price:
                    simpleVariant?.buying_price !== null && simpleVariant?.buying_price !== undefined
                        ? String(simpleVariant.buying_price)
                        : String(product.buying_price || ""),
                stock: Number(simpleVariant?.stock ?? product.stock ?? 0),
                unit: product.unit,
                quantity: 1,
            },
        };
    });

export default function Edit() {
    const { purchase, products, company_name } = usePage().props;
    const [clientError, setClientError] = useState("");
    const [variantModalProduct, setVariantModalProduct] = useState(null);

    const previousPaid = Number(purchase.paid_amount || 0);
    const productRows = useMemo(() => buildProductRows(products), [products]);

    const [form, setForm] = useState({
        supplier_name: purchase.supplier_name,
        notes: purchase.notes ?? "",
        purchase_date: purchase.purchase_date,
        payment_status: purchase.payment_status,
        new_paid: "",
        items: purchase.items.map((item) => ({
            line_key: item.product_variant_id
                ? `variant-${item.product_variant_id}`
                : `product-${item.product_id}`,
            product_id: item.product_id,
            product_variant_id: item.product_variant_id || null,
            name: item.product?.name || "",
            variant_name: getVariantName(item.product_variant),
            quantity: item.quantity,
            buying_price:
                item.buying_price !== null && item.buying_price !== undefined
                    ? String(item.buying_price)
                    : "",
        })),
    });

    const selectedLineKeys = useMemo(
        () => new Set(form.items.map((item) => item.line_key)),
        [form.items]
    );

    const getAvailableVariants = (productRow) =>
        productRow.variants.filter(
            (variant) => !selectedLineKeys.has(variant.line_key)
        );

    const totalAmount = form.items.reduce(
        (sum, item) => sum + Number(item.quantity) * Number(item.buying_price || 0),
        0
    );

    const remainingAmount = Math.max(totalAmount - previousPaid, 0);

    const addPurchaseOption = (option) => {
        setForm((current) => {
            const existing = current.items.find(
                (item) => item.line_key === option.line_key
            );

            if (existing) {
                return {
                    ...current,
                    items: current.items.map((item) =>
                        item.line_key === option.line_key
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                };
            }

            return {
                ...current,
                items: [...current.items, { ...option }],
            };
        });
    };

    const handleAddProduct = (productRow) => {
        if (productRow.has_attributes) {
            setVariantModalProduct(productRow);
            return;
        }

        addPurchaseOption(productRow.simple_option);
    };

    const updateItem = (lineKey, key, value) => {
        setForm((current) => ({
            ...current,
            items: current.items.map((item) =>
                item.line_key === lineKey
                    ? {
                          ...item,
                          [key]: key === "quantity" ? Math.max(Number(value) || 1, 1) : value,
                      }
                    : item
            ),
        }));
    };

    const removeItem = (lineKey) => {
        setForm((current) => ({
            ...current,
            items: current.items.filter((item) => item.line_key !== lineKey),
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const newPaidAmount = Number(form.new_paid || 0);

        const cumulativePaid = previousPaid + newPaidAmount;

        if (newPaidAmount < 0) {
            setClientError("Payment cannot be negative.");
            return;
        }

        if (cumulativePaid > totalAmount) {
            setClientError(
                `The payment exceeds the total amount by ${(cumulativePaid - totalAmount).toFixed(2)}.`
            );
            return;
        }

        setClientError("");

        router.put(route("purchases.update", purchase.id), {
            supplier_name: form.supplier_name,
            notes: form.notes,
            purchase_date: form.purchase_date,
            payment_status: form.payment_status,
            paid_amount: newPaidAmount,
            items: form.items.map((item) => ({
                product_id: item.product_id,
                product_variant_id: item.product_variant_id,
                quantity: item.quantity,
                buying_price: item.buying_price,
            })),
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit Purchase - ${company_name}`} />
            <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"purchases.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Edit Purchase</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Adjust supplier details, purchased variants, and payment updates without losing context.</p>
                        </div>
                    </div>
                </div>
                {clientError && (
                    <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                        {clientError}
                    </p>
                )}

                <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="required-label">Supplier Name:</label>
                            <input
                                type="text"
                                className="w-full"
                                value={form.supplier_name}
                                onChange={(e) =>
                                    setForm({ ...form, supplier_name: e.target.value })
                                }
                            />
                        </div>

                        <div>
                            <label className="required-label">Purchase Date:</label>
                            <input
                                type="date"
                                className="w-full"
                                value={form.purchase_date}
                                onChange={(e) =>
                                    setForm({ ...form, purchase_date: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div>
                        <label className="required-label">Payment Status:</label>
                        <select
                            className="w-full"
                            value={form.payment_status}
                            onChange={(e) =>
                                setForm({ ...form, payment_status: e.target.value })
                            }
                        >
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="unpaid">Unpaid</option>
                        </select>
                    </div>

                    <div>
                        <label>Notes:</label>
                        <input
                            type="text"
                            className="w-full"
                            value={form.notes}
                            onChange={(e) =>
                                setForm({ ...form, notes: e.target.value })
                            }
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <h2 className="font-semibold">Products</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border mt-2 min-w-[700px]">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border p-2">Product</th>
                                            <th className="border p-2">Type</th>
                                            <th className="border p-2">Stock</th>
                                            <th className="border p-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productRows
                                            .filter((product) => {
                                                if (!product.has_attributes) {
                                                    return !selectedLineKeys.has(
                                                        product.simple_option.line_key
                                                    );
                                                }

                                                return getAvailableVariants(product).length > 0;
                                            })
                                            .map((product) => (
                                                <tr key={product.id}>
                                                    <td className="border p-2">{product.name}</td>
                                                    <td className="border p-2">
                                                        {product.has_attributes
                                                            ? `${getAvailableVariants(product).length} variants left`
                                                            : "Standard"}
                                                    </td>
                                                    <td className="border p-2">{product.stock} {product.unit || ""}</td>
                                                    <td className="border p-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddProduct(product)}
                                                            className="bg-blue-500 text-white px-3 py-1 rounded"
                                                        >
                                                            Add Item
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h2 className="font-semibold">Items</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full border mt-2 min-w-[760px]">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border p-2">Product</th>
                                            <th className="border p-2">Variant</th>
                                            <th className="border p-2">Quantity</th>
                                            <th className="border p-2">Buying Price</th>
                                            <th className="border p-2">Total</th>
                                            <th className="border p-2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {form.items.length === 0 ? (
                                            <tr>
                                                <td className="border p-4 text-center text-slate-500" colSpan={6}>
                                                    No purchase items selected yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            form.items.map((item) => (
                                                <tr key={item.line_key}>
                                                    <td className="border p-2">{item.name}</td>
                                                    <td className="border p-2">{item.variant_name || "Standard"}</td>
                                                    <td className="border p-2">
                                                        <input
                                                            type="number"
                                                            className="w-full"
                                                            placeholder="Qty"
                                                            value={item.quantity}
                                                            min={1}
                                                            step="1"
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    item.line_key,
                                                                    "quantity",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="border p-2">
                                                        <input
                                                            type="number"
                                                            className="w-full"
                                                            placeholder="Buying Price"
                                                            value={item.buying_price}
                                                            min={0}
                                                            step="0.001"
                                                            onChange={(e) =>
                                                                updateItem(
                                                                    item.line_key,
                                                                    "buying_price",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="border p-2">
                                                        {(
                                                            Number(item.quantity) *
                                                            Number(item.buying_price || 0)
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="border p-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeItem(item.line_key)}
                                                            className="text-red-600"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="text-lg font-semibold">
                            Total Amount: {totalAmount.toFixed(2)}
                        </div>

                        {previousPaid > 0 && (
                            <div className="mt-2">
                                Previously Paid: {previousPaid.toFixed(2)}
                            </div>
                        )}

                        <div className="mt-2">
                            Remaining: {remainingAmount.toFixed(2)}
                        </div>

                        {(form.payment_status === "partial" || form.payment_status === "unpaid") &&
                            remainingAmount > 0 && (
                                <div className="mt-2">
                                    <label className="required-label">New Payment:</label>
                                    <input
                                        type="number"
                                        className="w-full"
                                        value={form.new_paid}
                                        min={0}
                                        step="0.001"
                                        placeholder={`Max: ${remainingAmount}`}
                                        onChange={(e) => {
                                            setForm({
                                                ...form,
                                                new_paid: e.target.value,
                                            });
                                        }}
                                    />
                                </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Update Purchase
                    </button>
                </form>

                {variantModalProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4">
                        <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700 dark:text-amber-300">
                                        Select Variant
                                    </p>
                                    <h3 className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                        {variantModalProduct.name}
                                    </h3>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        Choose which variant to add to this purchase.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setVariantModalProduct(null)}
                                    className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-600 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-100"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="space-y-3">
                                {getAvailableVariants(variantModalProduct).map((variant) => (
                                    <div
                                        key={variant.line_key}
                                        className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-800/60"
                                    >
                                        <div>
                                            <p className="font-medium text-slate-900 dark:text-slate-100">
                                                {variant.variant_name}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                Current stock: {variant.stock} {variant.unit || ""}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                                    Buying Price
                                                </p>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    {variant.buying_price || "0.00"}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    addPurchaseOption(variant);
                                                    const remainingVariants = getAvailableVariants(
                                                        variantModalProduct
                                                    ).filter(
                                                        (item) => item.line_key !== variant.line_key
                                                    );

                                                    if (remainingVariants.length === 0) {
                                                        setVariantModalProduct(null);
                                                    }
                                                }}
                                                className="create-button"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
