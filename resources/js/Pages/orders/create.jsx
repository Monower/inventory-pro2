import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { useState, useEffect, useMemo } from "react";
import { useForm } from "@inertiajs/react";
import Alert from "@/Components/Alert/Alert";

const getVariantName = (variant) => variant?.attribute_value?.name || "";

const clampQuantity = (value, stock) =>
    Math.max(1, Math.min(Number(value) || 1, stock));

const buildProductRows = (products = []) =>
    products.map((product) => {
        const variants = product.variants || [];
        const attributedVariants = variants.filter(
            (variant) => variant.attribute_value_id
        );
        const simpleVariant = variants.find((variant) => !variant.attribute_value_id);

        const orderableVariants = attributedVariants
            .map((variant) => ({
                line_key: `variant-${variant.id}`,
                product_id: product.id,
                product_variant_id: variant.id,
                name: product.name,
                variant_name: getVariantName(variant),
                display_name: `${product.name} - ${getVariantName(variant)}`,
                buying_price: Number(variant.buying_price ?? product.buying_price ?? 0),
                selling_price:
                    variant.selling_price !== null && variant.selling_price !== undefined
                        ? Number(variant.selling_price)
                        : null,
                stock: Number(variant.stock || 0),
                unit: product.unit,
            }))
            .filter((variant) => variant.selling_price !== null);

        return {
            id: product.id,
            name: product.name,
            selling_price: Number(product.selling_price),
            buying_price: Number(product.buying_price),
            has_attributes: attributedVariants.length > 0,
            stock: orderableVariants.length
                ? orderableVariants.reduce(
                      (sum, variant) => sum + Number(variant.stock || 0),
                      0
                  )
                : Number(simpleVariant?.stock ?? product.stock ?? 0),
            unit: product.unit,
            variants: orderableVariants,
            simple_option: {
                line_key: simpleVariant
                    ? `variant-${simpleVariant.id}`
                    : `product-${product.id}`,
                product_id: product.id,
                product_variant_id: simpleVariant?.id || null,
                name: product.name,
                variant_name: "",
                display_name: product.name,
                buying_price: Number(simpleVariant?.buying_price ?? product.buying_price ?? 0),
                selling_price: Number(simpleVariant?.selling_price ?? product.selling_price ?? 0),
                stock: Number(simpleVariant?.stock ?? product.stock ?? 0),
                unit: product.unit,
            },
        };
    });

const Create = ({ customers, products, banks }) => {
    const [cart, setCart] = useState([]);
    const [clientError, setClientError] = useState("");
    const [variantModalProduct, setVariantModalProduct] = useState(null);
    const [productSearch, setProductSearch] = useState("");

    // useForm hook for the order
    const { data, setData, post, errors, processing } = useForm({
        customer_id: "",
        payment_method: "cash",
        bank_id: "",
        mfs: "",
        payment_amount: "",
        cart: [],
    });

    const allErrors = Object.values(errors);
    const productRows = useMemo(() => buildProductRows(products), [products]);
    const selectedLineKeys = useMemo(
        () => new Set(cart.map((item) => item.line_key)),
        [cart]
    );
    const filteredProductRows = useMemo(() => {
        const search = productSearch.trim().toLowerCase();

        return productRows.filter((product) => {
            const matchesSearch =
                search === "" ||
                product.name.toLowerCase().includes(search) ||
                product.variants.some((variant) =>
                    variant.display_name.toLowerCase().includes(search)
                ) ||
                product.simple_option.display_name.toLowerCase().includes(search);

            if (!matchesSearch) {
                return false;
            }

            if (!product.has_attributes) {
                return !selectedLineKeys.has(product.simple_option.line_key);
            }

            return getAvailableVariants(product).length > 0;
        });
    }, [productRows, productSearch, selectedLineKeys]);

    // Add product to cart
    const addCartOption = (option) => {
        if (option.stock < 1) {
            setClientError(`No stock available for ${option.display_name}.`);
            return;
        }

        let nextError = "";

        setCart((prevCart) => {
            const existing = prevCart.find(
                (item) => item.line_key === option.line_key
            );

            if (existing) {
                if (existing.quantity >= option.stock) {
                    nextError = `Only ${option.stock} ${option.unit || "units"} available for ${option.display_name}.`;
                    return prevCart;
                }

                return prevCart.map((item) =>
                    item.line_key === option.line_key
                        ? {
                              ...item,
                              quantity: item.quantity + 1,
                              quantity_input: String(item.quantity + 1),
                          }
                        : item
                );
            }

            return [
                ...prevCart,
                { ...option, quantity: 1, quantity_input: "1" },
            ];
        });

        setClientError(nextError);
    };

    const handleAddProduct = (productRow) => {
        if (productRow.has_attributes) {
            setVariantModalProduct(productRow);
            return;
        }

        addCartOption(productRow.simple_option);
    };

    const getAvailableVariants = (productRow) =>
        productRow.variants.filter(
            (variant) => !selectedLineKeys.has(variant.line_key)
        );

    // Update quantity
    const updateQuantity = (lineKey, quantity) => {
        const digitsOnly = String(quantity).replace(/\D/g, "");

        setCart((prevCart) =>
            prevCart.map((item) =>
                item.line_key === lineKey
                    ? {
                          ...item,
                          quantity_input: digitsOnly,
                          quantity: digitsOnly
                              ? clampQuantity(digitsOnly, item.stock)
                              : item.quantity,
                      }
                    : item
            )
        );
    };

    const normalizeQuantityInput = (lineKey) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.line_key === lineKey
                    ? {
                          ...item,
                          quantity: clampQuantity(
                              item.quantity_input,
                              item.stock
                          ),
                          quantity_input: String(
                              clampQuantity(item.quantity_input, item.stock)
                          ),
                      }
                    : item
            )
        );
    };

    // Remove item
    const removeFromCart = (lineKey) => {
        setCart((prevCart) =>
            prevCart.filter((item) => item.line_key !== lineKey)
        );
    };

    // Totals
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce(
        (sum, item) => sum + item.selling_price * item.quantity,
        0
    );

    // Sync cart with form data whenever it changes
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

    // Submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            setClientError("Cart is empty.");
            return;
        }
        setClientError("");
        post(route("orders.store"));
    };

    return (
        <AuthenticatedLayout title="Create order">
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="flex items-start gap-4">
                            <BackButton url={"orders.index"} />
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                    Create Order
                                </p>
                                <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                    Build a new customer order
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    Add a product once, then choose its variant from a modal when needed.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Products
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {productRows.length}
                                </p>
                            </div>
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Customers
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {customers?.length ?? 0}
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

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Products & Cart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Products */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="mb-4">
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                    Products list
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Products with attributes will open a variant picker before they are added.
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
                                <table className="custom-table">
                                    <thead className="custom-thead">
                                        <tr>
                                            <th className="custom-th rounded-l-md">Product</th>
                                            <th className="custom-th">Type</th>
                                            <th className="custom-th">Selling price</th>
                                            <th className="custom-th">Stock</th>
                                            <th className="custom-th rounded-r-md">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredProductRows.length === 0 ? (
                                            <tr className="custom-body-tr">
                                                <td
                                                    className="custom-body-td text-center text-slate-500 dark:text-slate-400"
                                                    colSpan={5}
                                                >
                                                    No matching products available.
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredProductRows.map((product) => (
                                                <tr
                                                    key={product.id}
                                                    className="custom-body-tr"
                                                >
                                                    <td className="custom-body-td">
                                                        {product.name}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {product.has_attributes
                                                            ? `${getAvailableVariants(product).length} variants left`
                                                            : "Standard"}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {product.selling_price}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {product.stock} {product.unit || ""}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleAddProduct(product)
                                                            }
                                                            disabled={product.stock < 1}
                                                            className="create-button disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            Add to cart
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Cart */}
                        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                            <div className="mb-4 flex items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                        Cart list
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        Review variants, quantities, and line totals before checkout.
                                    </p>
                                </div>
                                <span className="rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                                    {cart.length} items
                                </span>
                            </div>
                            {cart.length === 0 ? (
                                <p className="text-slate-500 dark:text-slate-400">
                                    No items in cart
                                </p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="custom-table">
                                        <thead className="custom-thead">
                                            <tr>
                                                <th className="custom-th rounded-l-md">Product</th>
                                                <th className="custom-th">Variant</th>
                                                <th className="custom-th">Price</th>
                                                <th className="custom-th">Qty</th>
                                                <th className="custom-th">Total</th>
                                                <th className="custom-th rounded-r-md">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.map((item) => (
                                                <tr
                                                    key={item.line_key}
                                                    className="custom-body-tr"
                                                >
                                                    <td className="custom-body-td">
                                                        {item.name}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {item.variant_name || "Standard"}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {item.selling_price}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        <input
                                                            type="text"
                                                            value={
                                                                item.quantity_input ??
                                                                String(item.quantity)
                                                            }
                                                            inputMode="numeric"
                                                            pattern="[0-9]*"
                                                            onChange={(e) =>
                                                                updateQuantity(
                                                                    item.line_key,
                                                                    e.target
                                                                        .value
                                                                )
                                                            }
                                                            onBlur={() =>
                                                                normalizeQuantityInput(
                                                                    item.line_key
                                                                )
                                                            }
                                                            className="w-16 rounded-md custom-input border border-ring"
                                                        />
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {item.selling_price *
                                                            item.quantity}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                removeFromCart(
                                                                    item.line_key
                                                                )
                                                            }
                                                            className="rounded-lg bg-red-600 px-3 py-1 text-white transition hover:bg-red-700"
                                                        >
                                                            Remove from cart
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

                    {/* Checkout */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="mb-5">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                Checkout
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Confirm totals, select customer details, and complete payment information.
                            </p>
                        </div>
                        <div className="grid gap-6">
                            {/* Summary */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Total price</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {totalPrice}
                                    </h3>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Total quantity</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {totalQuantity}
                                    </h3>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Customers</p>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                        {customers?.length ?? 0}
                                    </h3>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/60">
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Payment mode</p>
                                    <h3 className="text-2xl font-bold capitalize text-slate-900 dark:text-slate-100">
                                        {data.payment_method}
                                    </h3>
                                </div>
                            </div>

                            {/* Customer */}
                            <div>
                                <label className="required-label mb-1">
                                    Select customer
                                </label>
                                <select
                                    value={data.customer_id}
                                    onChange={(e) =>
                                        setData("customer_id", e.target.value)
                                    }
                                    className="custom-input"
                                >
                                    <option value="">-- Select --</option>
                                    {customers?.map((customer) => (
                                        <option
                                            key={customer.id}
                                            value={customer.id}
                                        >
                                            {customer.phone}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer_id && (
                                    <p className="text-red-500 text-sm">
                                        {errors.customer_id}
                                    </p>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="required-label mb-2">
                                    Payment method
                                </label>
                                <div className="flex flex-wrap gap-6">
                                    {["cash", "bank", "mobile"].map(
                                        (method) => (
                                            <label
                                                key={method}
                                                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                                                    data.payment_method === method
                                                        ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-300"
                                                        : "border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value={method}
                                                    checked={
                                                        data.payment_method ===
                                                        method
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "payment_method",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="text-blue-600"
                                                />
                                                <span>
                                                    {method
                                                        .charAt(0)
                                                        .toUpperCase() +
                                                        method.slice(1)}
                                                </span>
                                            </label>
                                        )
                                    )}
                                </div>
                                {errors.payment_method && (
                                    <p className="text-red-500 text-sm">
                                        {errors.payment_method}
                                    </p>
                                )}
                            </div>

                            {/* Bank */}
                            {data?.payment_method === "bank" && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                                        Select bank
                                    </label>
                                    <select
                                        value={data?.bank_id}
                                        onChange={(e) =>
                                            setData("bank_id", e.target.value)
                                        }
                                        className="custom-input"
                                    >
                                        <option value="">
                                            -- Select bank --
                                        </option>
                                        {banks?.map((bank) => (
                                            <option
                                                key={bank.id}
                                                value={bank.id}
                                            >
                                                {bank.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.bank_id && (
                                        <p className="text-red-500 text-sm">
                                            {errors.bank_id}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Mobile */}
                            {data.payment_method === "mobile" && (
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                                        Select mobile financial service
                                    </label>
                                    <select
                                        value={data.mfs}
                                        onChange={(e) =>
                                            setData("mfs", e.target.value)
                                        }
                                        className="custom-input"
                                    >
                                        <option value="">
                                            -- Select MFS --
                                        </option>
                                        <option value="bkash">Bkash</option>
                                        <option value="nagad">Nagad</option>
                                        <option value="rocket">Rocket</option>
                                    </select>
                                    {errors.mfs && (
                                        <p className="text-red-500 text-sm">
                                            {errors.mfs}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Payment Amount */}
                            <div>
                                <label className="required-label mb-1">
                                    Payment amount
                                </label>
                                <input
                                    type="number"
                                    value={data.payment_amount}
                                    onChange={(e) =>
                                        setData(
                                            "payment_amount",
                                            e.target.value
                                        )
                                    }
                                    placeholder="Enter amount"
                                    className="custom-input"
                                />
                                {errors.payment_amount && (
                                    <p className="text-red-500 text-sm">
                                        {errors.payment_amount}
                                    </p>
                                )}
                            </div>

                            {/* Submit */}
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="create-button w-full md:w-auto px-6 py-2.5"
                                >
                                    {processing
                                        ? "Creating..."
                                        : "Create order"}
                                </button>
                            </div>
                        </div>
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
                                        Choose which variant to add to the cart.
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
                                                Stock: {variant.stock} {variant.unit || ""}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right">
                                                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                                                    Price
                                                </p>
                                                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                                    {variant.selling_price}
                                                </p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    addCartOption(variant);
                                                    const remainingVariants =
                                                        getAvailableVariants(
                                                            variantModalProduct
                                                        ).filter(
                                                            (item) =>
                                                                item.line_key !==
                                                                variant.line_key
                                                        );

                                                    if (
                                                        remainingVariants.length ===
                                                        0
                                                    ) {
                                                        setVariantModalProduct(null);
                                                    }
                                                }}
                                                disabled={variant.stock < 1}
                                                className="create-button disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {getAvailableVariants(variantModalProduct).length === 0 && (
                                    <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-400">
                                        All variants for this product are already selected.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
};

export default Create;
