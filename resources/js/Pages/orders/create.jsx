import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";

const Create = ({ customers, products, banks }) => {
    const [cart, setCart] = useState([]);

    // useForm hook for the order
    const { data, setData, post, errors, processing } = useForm({
        customer_id: "",
        payment_method: "",
        bank_id: "",
        mfs: "",
        payment_amount: "",
        cart: [],
    });

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
        setData("cart", cart.map((item) => ({ id: item.id, quantity: item.quantity })));
    }, [cart]);

    // Submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        if (cart.length === 0) {
            alert("Cart is empty.");
            return;
        }
        post("/orders");
    };

    return (
        <AuthenticatedLayout>
            <section className="max-w-7xl mx-auto p-4 md:p-6">
                <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-800">Create New Order</h3>
                    <p className="text-gray-500">Manage products, customers and checkout below.</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Products & Cart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Products */}
                        <div className="bg-white shadow-md rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4">Products List</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border border-gray-200 rounded-lg">
                                    <thead className="bg-gray-100 text-gray-700">
                                        <tr>
                                            <th className="px-3 py-2">Name</th>
                                            <th className="px-3 py-2">Buying Price</th>
                                            <th className="px-3 py-2">Selling Price</th>
                                            <th className="px-3 py-2">Stock</th>
                                            <th className="px-3 py-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products
                                            ?.filter((product) => !cart.find((item) => item.id === product.id))
                                            .map((product) => (
                                                <tr key={product.id} className="border-b hover:bg-gray-50">
                                                    <td className="px-3 py-2">{product.name}</td>
                                                    <td className="px-3 py-2">{product.buying_price}</td>
                                                    <td className="px-3 py-2">{product.selling_price}</td>
                                                    <td className="px-3 py-2">{product.stock}</td>
                                                    <td className="px-3 py-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => addToCart(product)}
                                                            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
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
                        <div className="bg-white shadow-md rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-4">Cart List</h3>
                            {cart.length === 0 ? (
                                <p className="text-gray-500">No items in cart</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border border-gray-200 rounded-lg">
                                        <thead className="bg-gray-100 text-gray-700">
                                            <tr>
                                                <th className="px-3 py-2">Name</th>
                                                <th className="px-3 py-2">Selling Price</th>
                                                <th className="px-3 py-2">Qty</th>
                                                <th className="px-3 py-2">Total</th>
                                                <th className="px-3 py-2">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.map((item) => (
                                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                                    <td className="px-3 py-2">{item.name}</td>
                                                    <td className="px-3 py-2">{item.selling_price}</td>
                                                    <td className="px-3 py-2">
                                                        <input
                                                            type="number"
                                                            value={item.quantity}
                                                            min="1"
                                                            onChange={(e) =>
                                                                updateQuantity(item.id, e.target.value)
                                                            }
                                                            className="w-16 border rounded-md px-2 py-1 text-center"
                                                        />
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        {item.selling_price * item.quantity}
                                                    </td>
                                                    <td className="px-3 py-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFromCart(item.id)}
                                                            className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600"
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
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-xl font-semibold mb-4">Checkout</h3>
                        <div className="grid gap-6">
                            {/* Summary */}
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-gray-600">Total Price</p>
                                    <h3 className="text-xl font-bold text-gray-800">{totalPrice}</h3>
                                </div>
                                <div>
                                    <p className="text-gray-600">Total Quantity</p>
                                    <h3 className="text-xl font-bold text-gray-800">{totalQuantity}</h3>
                                </div>
                            </div>

                            {/* Customer */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Customer
                                </label>
                                <select
                                    value={data.customer_id}
                                    onChange={(e) => setData("customer_id", e.target.value)}
                                    className="w-full border rounded-md px-3 py-2"
                                >
                                    <option value="">-- Select --</option>
                                    {customers?.map((customer) => (
                                        <option key={customer.id} value={customer.id}>
                                            {customer.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.customer_id && (
                                    <p className="text-red-500 text-sm">{errors.customer_id}</p>
                                )}
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method
                                </label>
                                <div className="flex flex-wrap gap-6">
                                    {["cash", "bank", "mobile"].map((method) => (
                                        <label key={method} className="flex items-center gap-2">
                                            <input
                                                type="radio"
                                                name="payment"
                                                value={method}
                                                checked={data.payment_method === method}
                                                onChange={(e) => setData("payment_method", e.target.value)}
                                                className="text-blue-600"
                                            />
                                            <span>{method.charAt(0).toUpperCase() + method.slice(1)}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.payment_method && (
                                    <p className="text-red-500 text-sm">{errors.payment_method}</p>
                                )}
                            </div>

                            {/* Bank */}
                            {data.payment_method === "bank" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Bank
                                    </label>
                                    <select
                                        value={data.bank_id}
                                        onChange={(e) => setData("bank_id", e.target.value)}
                                        className="w-full border rounded-md px-3 py-2"
                                    >
                                        <option value="">-- Select Bank --</option>
                                        {banks?.map((bank) => (
                                            <option key={bank.id} value={bank.id}>
                                                {bank.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.bank_id && (
                                        <p className="text-red-500 text-sm">{errors.bank_id}</p>
                                    )}
                                </div>
                            )}

                            {/* Mobile */}
                            {data.payment_method === "mobile" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Select Mobile Financial Service
                                    </label>
                                    <select
                                        value={data.mfs}
                                        onChange={(e) => setData("mfs", e.target.value)}
                                        className="w-full border rounded-md px-3 py-2"
                                    >
                                        <option value="">-- Select MFS --</option>
                                        <option value="bkash">Bkash</option>
                                        <option value="nagad">Nagad</option>
                                        <option value="rocket">Rocket</option>
                                    </select>
                                    {errors.mfs && (
                                        <p className="text-red-500 text-sm">{errors.mfs}</p>
                                    )}
                                </div>
                            )}

                            {/* Payment Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Payment Amount
                                </label>
                                <input
                                    type="number"
                                    value={data.payment_amount}
                                    onChange={(e) => setData("payment_amount", e.target.value)}
                                    placeholder="Enter amount"
                                    className="w-full border rounded-md px-3 py-2"
                                />
                                {errors.payment_amount && (
                                    <p className="text-red-500 text-sm">{errors.payment_amount}</p>
                                )}
                            </div>

                            {/* Submit */}
                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-green-600 text-white w-full md:w-auto px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
                                >
                                    {processing ? "Creating..." : "Create Order"}
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
