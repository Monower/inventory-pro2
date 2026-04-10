import React, { useState, useEffect, useMemo } from "react";
import { useForm, usePage, Head } from "@inertiajs/react";
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

export default function Create({ products }) {
    const { company_name } = usePage().props;
    const [rows, setRows] = useState([]);
    const [variantModalProduct, setVariantModalProduct] = useState(null);

    const { data, setData, post, processing, errors } = useForm({
        invoice_no: "",
        supplier_name: "",
        notes: "",
        purchase_date: "",
        payment_status: "paid",
        paid_amount: "0",
        items: [],
    });

    const productRows = useMemo(() => buildProductRows(products), [products]);
    const selectedLineKeys = useMemo(
        () => new Set(rows.map((item) => item.line_key)),
        [rows]
    );

    const getAvailableVariants = (productRow) =>
        productRow.variants.filter(
            (variant) => !selectedLineKeys.has(variant.line_key)
        );

    useEffect(() => {
        setData(
            "items",
            rows.map((row) => ({
                product_id: row.product_id,
                product_variant_id: row.product_variant_id,
                quantity: row.quantity,
                buying_price: row.buying_price,
            }))
        );
    }, [rows, setData]);

    const totalAmount = rows.reduce(
        (sum, row) => sum + Number(row.quantity) * Number(row.buying_price || 0),
        0
    );

    useEffect(() => {
        if (data.payment_status === "paid") {
            setData("paid_amount", String(totalAmount));
        }

        if (data.payment_status === "unpaid") {
            setData("paid_amount", "0");
        }
    }, [data.payment_status, totalAmount, setData]);

    useEffect(() => {
        if (
            data.payment_status === "partial" &&
            Number(data.paid_amount) > totalAmount
        ) {
            setData("paid_amount", String(totalAmount));
        }
    }, [data.paid_amount, data.payment_status, totalAmount, setData]);

    const addPurchaseOption = (option) => {
        setRows((prev) => {
            const existing = prev.find((item) => item.line_key === option.line_key);

            if (existing) {
                return prev.map((item) =>
                    item.line_key === option.line_key
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prev, { ...option }];
        });
    };

    const handleAddProduct = (productRow) => {
        if (productRow.has_attributes) {
            setVariantModalProduct(productRow);
            return;
        }

        addPurchaseOption(productRow.simple_option);
    };

    const updateRow = (lineKey, field, value) => {
        setRows((prev) =>
            prev.map((row) => {
                if (row.line_key !== lineKey) {
                    return row;
                }

                return {
                    ...row,
                    [field]: field === "quantity" ? Math.max(Number(value) || 1, 1) : value,
                };
            })
        );
    };

    const removeRow = (lineKey) => {
        setRows((prev) => prev.filter((row) => row.line_key !== lineKey));
    };

    const submit = (e) => {
        e.preventDefault();
        post(route("purchases.store"));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Create Purchase - ${company_name}`} />

            <div className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"purchases.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">New Purchase</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Record supplier purchases, choose variants when needed, and update stock accurately.</p>
                        </div>
                    </div>
                </div>

                <form onSubmit={submit} className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label>Invoice No</label>
                            <input
                                type="text"
                                className="w-full"
                                value={data.invoice_no}
                                onChange={(e) =>
                                    setData("invoice_no", e.target.value)
                                }
                                placeholder="Leave blank to auto generate"
                            />
                            {errors.invoice_no && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.invoice_no}
                                </p>
                            )}
                        </div>

                        <div>
                            <label>Supplier Name</label>
                            <input
                                type="text"
                                className="w-full"
                                value={data.supplier_name}
                                onChange={(e) =>
                                    setData("supplier_name", e.target.value)
                                }
                            />
                        </div>

                        <div className="md:col-start-2">
                            <label>Purchase Date</label>
                            <input
                                type="date"
                                className="w-full"
                                value={data.purchase_date}
                                onChange={(e) =>
                                    setData("purchase_date", e.target.value)
                                }
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label>Payment Status</label>
                        <select
                            className="w-full"
                            value={data.payment_status}
                            onChange={(e) =>
                                setData("payment_status", e.target.value)
                            }
                        >
                            <option value="paid">Paid</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="partial">Partial</option>
                        </select>
                    </div>

                    <div>
                        <label>Notes</label>
                        <input
                            type="text"
                            className="w-full"
                            value={data.notes}
                            onChange={(e) => setData("notes", e.target.value)}
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
                                                            className="create-button"
                                                        >
                                                            Add
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div>
                            <h2 className="font-semibold">Selected Items</h2>
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
                                        {rows.length === 0 ? (
                                            <tr>
                                                <td className="border p-4 text-center text-slate-500" colSpan={6}>
                                                    No purchase items selected yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            rows.map((row) => (
                                                <tr key={row.line_key}>
                                                    <td className="border p-2">{row.name}</td>
                                                    <td className="border p-2">{row.variant_name || "Standard"}</td>
                                                    <td className="border p-2">
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            className="w-full py-1"
                                                            value={row.quantity}
                                                            onChange={(e) =>
                                                                updateRow(
                                                                    row.line_key,
                                                                    "quantity",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="border p-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.001"
                                                            className="w-full py-1"
                                                            value={row.buying_price}
                                                            onChange={(e) =>
                                                                updateRow(
                                                                    row.line_key,
                                                                    "buying_price",
                                                                    e.target.value
                                                                )
                                                            }
                                                        />
                                                    </td>
                                                    <td className="border p-2">
                                                        {(
                                                            Number(row.quantity) *
                                                            Number(row.buying_price || 0)
                                                        ).toFixed(2)}
                                                    </td>
                                                    <td className="border p-2 text-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeRow(row.line_key)}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <div className="text-lg font-semibold flex items-end">
                            Total Amount: {totalAmount.toFixed(2)}
                        </div>

                        <div>
                            <label>Paid Amount</label>
                            <input
                                type="number"
                                min="0"
                                step="0.001"
                                className="w-full"
                                value={data.paid_amount}
                                onChange={(e) => {
                                    const { value } = e.target;

                                    if (value === "") {
                                        setData("paid_amount", "");
                                        return;
                                    }

                                    setData(
                                        "paid_amount",
                                        Number(value) > totalAmount
                                            ? String(totalAmount)
                                            : value
                                    );
                                }}
                                disabled={data.payment_status !== "partial"}
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Save Purchase
                        </button>
                    </div>
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
