import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import Alert from "@/Components/Alert/Alert";

const Create = ({ customers, products, banks }) => {
    const [cart, setCart] = useState([]);
    const [clientError, setClientError] = useState("");

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

    // Add product to cart
    const addToCart = (product) => {
        setCart((prevCart) => {
            const existing = prevCart.find((item) => item.id === product.id);
            if (existing) {
                return prevCart.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
            }
        });
    };

    // Update quantity
    const updateQuantity = (id, quantity) => {
        if (quantity < 1) return;
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id ? { ...item, quantity: Number(quantity) } : item
            )
        );
    };

    // Remove item
    const removeFromCart = (id) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
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
            cart.map((item) => ({ id: item.id, quantity: item.quantity }))
        );
    }, [cart]);

    // Submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            setClientError("Cart is empty.");
            return;
        }
        setClientError("");
        post("/orders");
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
                                    Manage products, customers and checkout below.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Products
                                </p>
                                <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
                                    {products?.length ?? 0}
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
                                    Add available products to the current order.
                                </p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="custom-table">
                                    <thead className="custom-thead">
                                        <tr>
                                            <th className="custom-th rounded-l-md">
                                                Name
                                            </th>
                                            <th className="custom-th">
                                                Buying price
                                            </th>
                                            <th className="custom-th">
                                                Selling price
                                            </th>
                                            <th className="custom-th">Stock</th>
                                            <th className="custom-th rounded-r-md">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products
                                            ?.filter(
                                                (product) =>
                                                    !cart.find(
                                                        (item) =>
                                                            item.id ===
                                                            product.id
                                                    )
                                            )
                                            .map((product) => (
                                                <tr
                                                    key={product.id}
                                                    className="custom-body-tr"
                                                >
                                                    <td className="custom-body-td">
                                                        {product.name}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {product.buying_price}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {product.selling_price}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {product.stock}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                addToCart(
                                                                    product
                                                                )
                                                            }
                                                            className="create-button"
                                                        >
                                                            Add to cart
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
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
                                        Review quantity and remove items before checkout.
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
                                                <th className="custom-th rounded-l-md">
                                                    Name
                                                </th>
                                                <th className="custom-th">
                                                    Selling price
                                                </th>
                                                <th className="custom-th">
                                                    Qty
                                                </th>
                                                <th className="custom-th">
                                                    Total
                                                </th>
                                                <th className="custom-th rounded-r-md">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.map((item) => (
                                                <tr
                                                    key={item.id}
                                                    className="custom-body-tr"
                                                >
                                                    <td className="custom-body-td">
                                                        {item.name}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        {item.selling_price}
                                                    </td>
                                                    <td className="custom-body-td">
                                                        <input
                                                            type="number"
                                                            value={
                                                                item.quantity
                                                            }
                                                            min="1"
                                                            onChange={(e) =>
                                                                updateQuantity(
                                                                    item.id,
                                                                    e.target
                                                                        .value
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
                                                                    item.id
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
            </section>
        </AuthenticatedLayout>
    );
};

export default Create;
