import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import Alert from "@/Components/Alert/Alert";
import { useState, useEffect, useMemo } from "react";
import { useForm, usePage, Link } from "@inertiajs/react";

const getVariantName = (variant) => variant?.attribute_value?.name || "";

const buildSaleOptions = (products = []) =>
    products.flatMap((product) => {
        const variants = product.variants || [];
        const attributedVariants = variants.filter(
            (variant) => variant.attribute_value_id
        );

        if (attributedVariants.length > 0) {
            return attributedVariants.map((variant) => ({
                line_key: `variant-${variant.id}`,
                product_id: product.id,
                product_variant_id: variant.id,
                name: product.name,
                variant_name: getVariantName(variant),
                display_name: `${product.name} - ${getVariantName(variant)}`,
                selling_price:
                    variant.selling_price !== null && variant.selling_price !== undefined
                        ? Number(variant.selling_price)
                        : null,
                stock: Number(variant.stock || 0),
                unit: product.unit,
            })).filter((variant) => variant.selling_price !== null);
        }

        const simpleVariant = variants.find((variant) => !variant.attribute_value_id);

        return [
            {
                line_key: simpleVariant
                    ? `variant-${simpleVariant.id}`
                    : `product-${product.id}`,
                product_id: product.id,
                product_variant_id: simpleVariant?.id || null,
                name: product.name,
                variant_name: "",
                display_name: product.name,
                selling_price: Number(simpleVariant?.selling_price ?? product.selling_price ?? 0),
                stock: Number(simpleVariant?.stock ?? product.stock ?? 0),
                unit: product.unit,
            },
        ];
    });

const Edit = ({ order, customers, products, banks }) => {
    const { company_name } = usePage().props;
    const [clientError, setClientError] = useState("");
    const [productSearch, setProductSearch] = useState("");

    const { data, setData, put, processing, errors } = useForm({
        customer_id: order.customer_id,
        payment_amount:
            order.paid_amount !== null && order.paid_amount !== undefined
                ? String(order.paid_amount)
                : "",
        payment_method: order.payment_method || "cash",
        bank_id: order.bank_id || "",
        mfs: order.mfs || "",
        cart: [],
    });

    const allErrors = Object.values(errors);
    const saleOptions = useMemo(() => buildSaleOptions(products), [products]);
    const filteredSaleOptions = useMemo(() => {
        const search = productSearch.trim().toLowerCase();

        return saleOptions.filter((option) => {
            const matchesSearch =
                search === "" ||
                option.name.toLowerCase().includes(search) ||
                option.display_name.toLowerCase().includes(search) ||
                option.variant_name.toLowerCase().includes(search);

            return (
                matchesSearch &&
                !cart.find((item) => item.line_key === option.line_key)
            );
        });
    }, [cart, productSearch, saleOptions]);

    const [cart, setCart] = useState(
        order.items.map((item) => ({
            line_key: item.product_variant_id
                ? `variant-${item.product_variant_id}`
                : `product-${item.product.id}`,
            product_id: item.product.id,
            product_variant_id: item.product_variant_id || null,
            name: item.product.name,
            variant_name: getVariantName(item.product_variant),
            selling_price: Number(item.price),
            stock: Number(item.product_variant?.stock ?? item.product.stock ?? 0),
            unit: item.product.unit,
            quantity: item.quantity,
        }))
    );

    useEffect(() => {
        setData(
            "cart",
            cart.map((item) => ({
                product_id: item.product_id,
                product_variant_id: item.product_variant_id,
                quantity: item.quantity,
            }))
        );
    }, [cart, setData]);

    useEffect(() => {
        if (data.payment_method !== "bank") {
            setData("bank_id", "");
        }

        if (data.payment_method !== "mobile") {
            setData("mfs", "");
        }
    }, [data.payment_method, setData]);

    const addToCart = (option) => {
        if (option.stock < 1) {
            setClientError(`No stock available for ${option.display_name}.`);
            return;
        }

        let nextError = "";

        setCart((prev) => {
            const existing = prev.find((item) => item.line_key === option.line_key);

            if (existing) {
                if (existing.quantity >= option.stock) {
                    nextError = `Only ${option.stock} ${option.unit || "units"} available for ${option.display_name}.`;
                    return prev;
                }

                return prev.map((item) =>
                    item.line_key === option.line_key
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prev, { ...option, quantity: 1 }];
        });

        setClientError(nextError);
    };

    const updateQuantity = (lineKey, qty) => {
        setCart((prev) =>
            prev.map((item) =>
                item.line_key === lineKey
                    ? {
                          ...item,
                          quantity: Math.max(
                              1,
                              Math.min(Number(qty) || 1, item.stock)
                          ),
                      }
                    : item
            )
        );
    };

    const removeFromCart = (lineKey) => {
        setCart((prev) => prev.filter((item) => item.line_key !== lineKey));
    };

    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce(
        (sum, item) => sum + item.selling_price * item.quantity,
        0
    );

    const paidAmount = Number(data.payment_amount) || 0;
    const dueAmount = Math.max(totalPrice - paidAmount, 0);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            setClientError("Cart cannot be empty.");
            return;
        }

        if (paidAmount > totalPrice) {
            setClientError("Payment amount cannot exceed total amount.");
            return;
        }

        setClientError("");
        put(route("orders.update", order.id));
    };

    return (
        <AuthenticatedLayout title="Edit order">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex items-start gap-4">
                            <BackButton url={"orders.index"} />
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                    Edit Order
                                </p>
                                <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                    Edit order: {order.order_number}
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    Update order lines by product variant and review stock-aware quantities.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Current items
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {cart.length}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Paid now
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {paidAmount}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {allErrors.length > 0 && (
                    <Alert
                        flash={{
                            error: (
                                <ul className="list-disc pl-5">
                                    {allErrors.map((err, idx) => (
                                        <li key={idx}>{err}</li>
                                    ))}
                                </ul>
                            ),
                        }}
                    />
                )}
                {clientError && (
                    <Alert flash={{ error: clientError }} autoHideMs={3000} />
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                Products list
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Add more product variants that are not already in this order.
                            </p>
                        </div>
                        <div className="mb-4">
                            <input
                                type="text"
                                value={productSearch}
                                onChange={(e) =>
                                    setProductSearch(e.target.value)
                                }
                                placeholder="Search products or variants..."
                                className="custom-input"
                            />
                        </div>
                        <div className="h-[420px] overflow-auto">
                            <table className="custom-table min-w-[640px]">
                                <thead className="custom-thead">
                                    <tr>
                                        <th className="custom-th">Product</th>
                                        <th className="custom-th">Variant</th>
                                        <th className="custom-th">Price</th>
                                        <th className="custom-th">Stock</th>
                                        <th className="custom-th">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSaleOptions.length === 0 ? (
                                        <tr>
                                            <td
                                                className="custom-body-td text-center text-slate-500 dark:text-slate-400"
                                                colSpan={5}
                                            >
                                                No matching products available.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredSaleOptions.map((option) => (
                                            <tr key={option.line_key}>
                                                <td className="custom-body-td">{option.name}</td>
                                                <td className="custom-body-td">
                                                    {option.variant_name || "Standard"}
                                                </td>
                                                <td className="custom-body-td">
                                                    {option.selling_price}
                                                </td>
                                                <td className="custom-body-td">
                                                    {option.stock} {option.unit || ""}
                                                </td>
                                                <td className="custom-body-td">
                                                    <button
                                                        type="button"
                                                        onClick={() => addToCart(option)}
                                                        disabled={option.stock < 1}
                                                        className="create-button disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        Add
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                    Cart
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Update variant quantities, review totals, and remove items if needed.
                                </p>
                            </div>
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                {cart.length} items
                            </span>
                        </div>

                        {cart.length === 0 ? (
                            <p className="text-slate-500 dark:text-slate-400">No items</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="custom-table min-w-[640px]">
                                    <thead className="custom-thead">
                                        <tr>
                                            <th className="custom-th">Product</th>
                                            <th className="custom-th">Variant</th>
                                            <th className="custom-th">Price</th>
                                            <th className="custom-th">Qty</th>
                                            <th className="custom-th">Total</th>
                                            <th className="custom-th">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((item) => (
                                            <tr key={item.line_key}>
                                                <td className="custom-body-td">{item.name}</td>
                                                <td className="custom-body-td">
                                                    {item.variant_name || "Standard"}
                                                </td>
                                                <td className="custom-body-td">
                                                    {item.selling_price}
                                                </td>
                                                <td className="custom-body-td">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        max={item.stock}
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateQuantity(
                                                                item.line_key,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-20 custom-input"
                                                    />
                                                </td>
                                                <td className="custom-body-td">
                                                    {item.selling_price * item.quantity}
                                                </td>
                                                <td className="custom-body-td">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeFromCart(item.line_key)
                                                        }
                                                        className="rounded-lg bg-red-600 px-3 py-1 text-white transition hover:bg-red-700"
                                                    >
                                                        Remove
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                    <div className="mb-5">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                            Checkout
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Review the order summary, payment method, and final amount before updating.
                        </p>
                    </div>

                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Total</p>
                            <strong className="text-2xl text-slate-900 dark:text-slate-100">{totalPrice}</strong>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Quantity</p>
                            <strong className="text-2xl text-slate-900 dark:text-slate-100">{totalQuantity}</strong>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Paid</p>
                            <strong className="text-2xl text-slate-900 dark:text-slate-100">{paidAmount}</strong>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Due</p>
                            <strong className="text-2xl text-slate-900 dark:text-slate-100">{dueAmount}</strong>
                        </div>
                    </div>

                    <div>
                        <label className="required-label mb-1">
                            Select customer
                        </label>
                        <select
                            value={data.customer_id}
                            onChange={(e) =>
                                setData("customer_id", e.target.value)
                            }
                            className="custom-input mb-4"
                        >
                            <option value="">-- Select customer --</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.phone}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="required-label mb-2">
                            Payment method
                        </label>
                        <div className="flex flex-wrap gap-4 mb-4">
                            {["cash", "bank", "mobile"].map((m) => (
                                <label
                                    key={m}
                                    className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium capitalize transition ${
                                        data.payment_method === m
                                            ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
                                            : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                    }`}
                                >
                                    <input
                                        type="radio"
                                        value={m}
                                        checked={data.payment_method === m}
                                        onChange={(e) =>
                                            setData(
                                                "payment_method",
                                                e.target.value
                                            )
                                        }
                                    />
                                    {m}
                                </label>
                            ))}
                        </div>
                    </div>

                    {data.payment_method === "bank" && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Select bank
                            </label>
                            <select
                                value={data.bank_id}
                                onChange={(e) => setData("bank_id", e.target.value)}
                                className="custom-input mb-4"
                            >
                                <option value="">-- Select Bank --</option>
                                {banks.map((b) => (
                                    <option key={b.id} value={b.id}>
                                        {b.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {data.payment_method === "mobile" && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                                Select mobile financial service
                            </label>
                            <select
                                value={data.mfs}
                                onChange={(e) => setData("mfs", e.target.value)}
                                className="custom-input mb-4"
                            >
                                <option value="">-- Select MFS --</option>
                                <option value="bkash">Bkash</option>
                                <option value="nagad">Nagad</option>
                                <option value="rocket">Rocket</option>
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="required-label mb-1">
                            Payment amount
                        </label>
                        <input
                            type="number"
                            min="0"
                            max={totalPrice}
                            value={data.payment_amount}
                            onChange={(e) => {
                                const { value } = e.target;

                                if (value === "") {
                                    setData("payment_amount", "");
                                    return;
                                }

                                setData(
                                    "payment_amount",
                                    Number(value) > totalPrice
                                        ? String(totalPrice)
                                        : value
                                );
                            }}
                            className="custom-input mb-4"
                            placeholder="Payment amount"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="edit-button px-6 py-2.5"
                        >
                            {processing ? "Updating..." : "Update order"}
                        </button>

                        <Link
                            href={route("orders.index")}
                            className="delete-button"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
