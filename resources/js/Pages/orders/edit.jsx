import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import Alert from "@/Components/Alert/Alert";
import { useState, useEffect } from "react";
import { useForm, Head, usePage, Link } from "@inertiajs/react";

const Edit = ({ order, customers, products, banks }) => {
    const { company_name, flash } = usePage().props;

    /* -----------------------------
        Form
    ------------------------------ */
    const { data, setData, put, processing, errors } = useForm({
        customer_id: order.customer_id,
        payment_amount: Number(order.paid_amount) || 0,
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
            alert("Cart cannot be empty.");
            return;
        }

        if (paidAmount > totalPrice) {
            alert("Payment amount cannot exceed total amount.");
            return;
        }

        put(route("orders.update", order.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit order - ${company_name}`} />

            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"orders.index"} />
                    <div>
                        <h3 className="heading">
                            Edit order: {order.order_number}
                        </h3>
                        <p className="text-gray-500">
                            Manage products, customers and checkout below.
                        </p>
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

                {/* Flash */}
                {(flash?.success || flash?.error) && <Alert flash={flash} />}

                {/* Products & Cart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Products */}
                    <div className="bg-background border border-ring shadow-md rounded-lg p-4">
                        <h3 className="heading">Products list</h3>
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
                                            (p) => !cart.find((c) => c.id === p.id)
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
                    <div className="bg-background border border-ring shadow-md rounded-lg p-4">
                        <h3 className="heading">Cart</h3>

                        {cart.length === 0 ? (
                            <p className="text-gray-500">No items</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="custom-table min-w-[640px]">
                                    <thead className="custom-thead">
                                        <tr>
                                            <th className="custom-th">Name</th>
                                            <th className="custom-th">Price</th>
                                            <th className="custom-th">Qty</th>
                                            <th className="custom-th">Total</th>
                                            <th className="custom-th">Action</th>
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
                                                            removeFromCart(item.id)
                                                        }
                                                        className="bg-destructive text-white px-3 py-1 rounded"
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
                    className="bg-background border border-ring shadow-md rounded-lg p-4"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div>
                            <p>Total</p>
                            <strong>{totalPrice}</strong>
                        </div>
                        <div>
                            <p>Quantity</p>
                            <strong>{totalQuantity}</strong>
                        </div>
                        <div>
                            <p>Paid</p>
                            <strong>{paidAmount}</strong>
                        </div>
                        <div>
                            <p>Due</p>
                            <strong>{dueAmount}</strong>
                        </div>
                    </div>

                    {/* Customer */}
                    <select
                        value={data.customer_id}
                        onChange={(e) => setData("customer_id", e.target.value)}
                        className="custom-input mb-4"
                    >
                        <option value="">-- Select Customer --</option>
                        {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>

                    {/* Payment */}
                    <div className="flex flex-wrap gap-4 mb-4">
                        {["cash", "bank", "mobile"].map((m) => (
                            <label key={m} className="flex gap-2">
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

                    {data.payment_method === "bank" && (
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
                    )}

                    {data.payment_method === "mobile" && (
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
                    )}

                    {/* PAYMENT INPUT (CLAMPED) */}
                    <input
                        type="number"
                        min="0"
                        max={totalPrice}
                        value={data.payment_amount}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            setData(
                                "payment_amount",
                                value > totalPrice ? totalPrice : value
                            );
                        }}
                        className="custom-input mb-4"
                        placeholder="Payment amount"
                    />

                    <div className="flex items-center gap-4">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-green-600 text-white px-4 py-1 rounded-lg"
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
