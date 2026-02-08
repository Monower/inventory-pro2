import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import Alert from "@/Components/Alert/Alert";
import { useState, useEffect } from "react";
import { useForm, Head, usePage } from "@inertiajs/react";

const Edit = ({ order, customers, products, banks }) => {
    console.log("order: ", order);
    const { company_name, flash } = usePage().props;
    const { data, setData, put, processing, errors } = useForm({
        customer_id: order.customer_id,
        payment_amount: order.paid_amount,
        payment_method: order.payment_method || "cash",
        bank_id: order.bank_id || "",
        mfs: order.mfs || "",
        cart: [],
    });

    const allErrors = Object.values(errors);

    const [cart, setCart] = useState(
        order.items.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            selling_price: i.price,
            quantity: i.quantity,
        }))
    );

    /* -----------------------------
        Cart → Form Sync (IMPORTANT)
    ------------------------------ */
    useEffect(() => {
        setData(
            "cart",
            cart.map((item) => ({
                id: item.id,
                quantity: item.quantity,
            }))
        );
    }, [cart]);

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
        if (qty < 1) return;
        setCart((prev) =>
            prev.map((i) => (i.id === id ? { ...i, quantity: Number(qty) } : i))
        );
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((i) => i.id !== id));
    };

    /* -----------------------------
        Totals
    ------------------------------ */
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce(
        (sum, i) => sum + i.selling_price * i.quantity,
        0
    );

    /* -----------------------------
        Submit
    ------------------------------ */
    const handleSubmit = (e) => {
        e.preventDefault();
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

                {/* Products & Cart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Products */}
                    <div className="bg-background border border-ring shadow-md rounded-lg p-4">
                        <h3 className="heading">Products list</h3>
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
                                        .filter(
                                            (product) =>
                                                !cart.find(
                                                    (item) =>
                                                        item.id === product.id
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
                    <div className="bg-background border border-ring shadow-md rounded-lg p-4">
                        <h3 className="heading">Cart list</h3>
                        {cart.length === 0 ? (
                            <p className="text-gray-500">No items in cart</p>
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
                                            <th className="custom-th">Qty</th>
                                            <th className="custom-th">Total</th>
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
                                                        value={item.quantity}
                                                        min="1"
                                                        onChange={(e) =>
                                                            updateQuantity(
                                                                item.id,
                                                                e.target.value
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
                                                        className="bg-destructive text-white px-3 py-1 rounded-md hover:bg-red-700 ease-in-out duration-300"
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
                <form
                    onSubmit={handleSubmit}
                    className="bg-background border border-ring shadow-md rounded-lg p-4"
                >
                    {/* Summary */}
                    <div className="grid grid-cols-2 gap-4 bg-background* border border-ring shadow-md py-50 p-4 rounded-lg">
                        <div>
                            <p className="text-primary">Total amount</p>
                            <h3 className="text-xl font-bold text-primary">
                                {totalPrice}
                            </h3>
                        </div>
                        <div>
                            <p className="text-primary">Paid amount</p>
                            <h3 className="text-xl font-bold text-primary">
                                {order?.paid_amount || 0}
                            </h3>
                        </div>
                        <div>
                            <p className="text-primary">Due amount</p>
                            <h3 className="text-xl font-bold text-primary">
                                {order?.due_amount || 0}
                            </h3>
                        </div>
                        <div>
                            <p className="text-primary">Total quantity</p>
                            <h3 className="text-xl font-bold text-primary">
                                {totalQuantity}
                            </h3>
                        </div>
                    </div>

                    {/* Customer */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-primary mb-1">
                            Customer
                        </label>
                        <select
                            value={data.customer_id}
                            onChange={(e) =>
                                setData("customer_id", e.target.value)
                            }
                            className="custom-input"
                        >
                            <option value="">-- Select --</option>
                            {customers.map((customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.name}
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
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">
                            Payment method
                        </label>
                        <div className="flex gap-4">
                            {["cash", "bank", "mobile"].map((method) => (
                                <label key={method} className="flex gap-2">
                                    <input
                                        type="radio"
                                        value={method}
                                        checked={data.payment_method === method}
                                        onChange={(e) =>
                                            setData(
                                                "payment_method",
                                                e.target.value
                                            )
                                        }
                                    />
                                    {method.charAt(0).toUpperCase() +
                                        method.slice(1)}
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Conditional fields */}
                    {data.payment_method === "bank" && (
                        <select
                            value={data.bank_id}
                            onChange={(e) => setData("bank_id", e.target.value)}
                            className="custom-input"
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
                            className="custom-input"
                        >
                            <option value="">-- Select MFS --</option>
                            <option value="bkash">Bkash</option>
                            <option value="nagad">Nagad</option>
                            <option value="rocket">Rocket</option>
                        </select>
                    )}

                    {/* Payment Amount */}
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">
                            Payment amount
                        </label>
                        <input
                            type="number"
                            value={data.payment_amount}
                            onChange={(e) =>
                                setData("payment_amount", e.target.value)
                            }
                            className="custom-input"
                        />
                    </div>

                    <p className="font-semibold mb-4">
                        Total price: {totalPrice}
                    </p>

                    <button
                        type="submit"
                        disabled={processing}
                        className="bg-green-600 text-white w-full md:w-auto px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                    >
                        {processing ? "Updating..." : "Update order"}
                    </button>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
