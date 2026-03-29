import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import Alert from "@/Components/Alert/Alert";
import { useState, useEffect } from "react";
import { useForm, usePage, Link } from "@inertiajs/react";

const Edit = ({ order, customers, products, banks }) => {
    const { company_name } = usePage().props;
    const [clientError, setClientError] = useState("");

    /* -----------------------------
        Form
    ------------------------------ */
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

    /* -----------------------------
        Cart State
    ------------------------------ */
    const [cart, setCart] = useState(
        order.items.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            selling_price: i.price,
            quantity: i.quantity,
        }))
    );

    /* -----------------------------
        Sync Cart → Form (FIXED)
    ------------------------------ */
    useEffect(() => {
        setData(
            "cart",
            cart.map((item) => ({
                product_id: item.id, // ✅ backend expects this
                quantity: item.quantity,
            }))
        );
    }, [cart]);

    /* -----------------------------
        Reset Conditional Fields
    ------------------------------ */
    useEffect(() => {
        if (data.payment_method !== "bank") {
            setData("bank_id", "");
        }

        if (data.payment_method !== "mobile") {
            setData("mfs", "");
        }
    }, [data.payment_method]);

    /* -----------------------------
        Cart Actions
    ------------------------------ */
    const addToCart = (product) => {
        setCart((prev) => {
            const existing = prev.find((i) => i.id === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }

            return [
                ...prev,
                {
                    id: product.id,
                    name: product.name,
                    selling_price: product.selling_price,
                    quantity: 1,
                },
            ];
        });
    };

    const updateQuantity = (id, qty) => {
        const quantity = Math.max(Number(qty), 1);
        setCart((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity } : i))
        );
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((i) => i.id !== id));
    };

    /* -----------------------------
        Totals
    ------------------------------ */
    const totalQuantity = cart.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = cart.reduce(
        (sum, i) => sum + i.selling_price * i.quantity,
        0
    );

    const paidAmount = Number(data.payment_amount) || 0;
    const dueAmount = Math.max(totalPrice - paidAmount, 0);

    /* -----------------------------
        Submit (BLOCK OVERPAY)
    ------------------------------ */
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
                                    Manage products, customers and checkout below.
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

                {/* Errors */}
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

                {/* Products & Cart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Products */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="mb-4">
                            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                Products list
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Add more products that are not already in this order.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="custom-table min-w-[640px]">
                                <thead className="custom-thead">
                                    <tr>
                                        <th className="custom-th">Name</th>
                                        <th className="custom-th">Price</th>
                                        <th className="custom-th">Stock</th>
                                        <th className="custom-th">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products
                                        .filter(
                                            (p) =>
                                                !cart.find((c) => c.id === p.id)
                                        )
                                        .map((product) => (
                                            <tr key={product.id}>
                                                <td className="custom-body-td">
                                                    {product.name}
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
                                                            addToCart(product)
                                                        }
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

                    {/* Cart */}
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                                    Cart
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    Update quantities, review totals, and remove items if needed.
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
                                            <th className="custom-th">Name</th>
                                            <th className="custom-th">Price</th>
                                            <th className="custom-th">Qty</th>
                                            <th className="custom-th">Total</th>
                                            <th className="custom-th">
                                                Action
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map((item) => (
                                            <tr key={item.id}>
                                                <td className="custom-body-td">
                                                    {item.name}
                                                </td>
                                                <td className="custom-body-td">
                                                    {item.selling_price}
                                                </td>
                                                <td className="custom-body-td">
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={item.quantity}
                                                        onChange={(e) =>
                                                            updateQuantity(
                                                                item.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-16 custom-input"
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

                {/* Checkout */}
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

                    {/* Payment */}
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

                    {/* PAYMENT INPUT (CLAMPED) */}
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
