import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useState } from "react";
import { useForm } from "@inertiajs/react";

const Edit = ({ order, customers, products, banks }) => {
    const { data, setData, put, processing, errors } = useForm({
        customer_id: order.customer_id,
        payment_amount: order.paid_amount,
        payment_method: order.payment_method || "cash",
        bank_id: order.bank_id || "",
        mfs: order.mfs || "",
    });

    const [cart, setCart] = useState(order.items.map(i => ({
        product_id: i.product.id,
        name: i.product.name,
        selling_price: i.price,
        quantity: i.quantity
    })));

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(i => i.product_id === product.id);
            if (existing) return prev.map(i => i.product_id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
            return [...prev, { product_id: product.id, name: product.name, selling_price: product.selling_price, quantity: 1 }];
        });
    };

    const updateQuantity = (id, qty) => {
        if (qty < 1) return;
        setCart(prev => prev.map(i => i.product_id === id ? { ...i, quantity: Number(qty) } : i));
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(i => i.product_id !== id));

    const totalPrice = cart.reduce((sum, i) => sum + i.selling_price * i.quantity, 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("orders.update", order.id), { data: { ...data, cart } });
    };

    return (
        <AuthenticatedLayout>
            <section className="max-w-7xl mx-auto p-4 md:p-6">
                <h3 className="text-2xl font-bold mb-4">Edit Order: {order.order_number}</h3>

                {/* Products & Cart */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Products */}
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Products</h3>
                        <table className="w-full text-sm border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th>Name</th><th>Price</th><th>Stock</th><th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.filter(p => !cart.find(c => c.product_id === p.id)).map(p => (
                                    <tr key={p.id} className="border-b hover:bg-gray-50">
                                        <td>{p.name}</td>
                                        <td>{p.selling_price}</td>
                                        <td>{p.stock}</td>
                                        <td><button onClick={() => addToCart(p)} className="bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">Add</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Cart */}
                    <div className="bg-white shadow-md rounded-lg p-4">
                        <h3 className="text-lg font-semibold mb-4">Cart</h3>
                        {cart.length === 0 ? <p className="text-gray-500">No items in cart</p> :
                        <table className="w-full text-sm border border-gray-200 rounded-lg">
                            <thead className="bg-gray-100">
                                <tr><th>Name</th><th>Price</th><th>Qty</th><th>Total</th><th>Action</th></tr>
                            </thead>
                            <tbody>
                                {cart.map(i => (
                                    <tr key={i.product_id} className="border-b hover:bg-gray-50">
                                        <td>{i.name}</td>
                                        <td>{i.selling_price}</td>
                                        <td>
                                            <input type="number" value={i.quantity} min="1" onChange={e => updateQuantity(i.product_id, e.target.value)} className="w-16 border rounded px-1 text-center"/>
                                        </td>
                                        <td>{i.selling_price * i.quantity}</td>
                                        <td><button onClick={() => removeFromCart(i.product_id)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Remove</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>}
                    </div>
                </div>

                {/* Checkout */}
                <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Customer</label>
                        <select value={data.customer_id} onChange={e => setData("customer_id", e.target.value)} className="w-full border rounded px-3 py-2">
                            <option value="">-- Select Customer --</option>
                            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        {errors.customer_id && <p className="text-red-500">{errors.customer_id}</p>}
                    </div>

                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Payment Method</label>
                        <div className="flex gap-4">
                            {["cash","bank","mobile"].map(m => (
                                <label key={m} className="flex items-center gap-2">
                                    <input type="radio" name="payment_method" value={m} checked={data.payment_method===m} onChange={e=>setData("payment_method",e.target.value)}/>
                                    {m.charAt(0).toUpperCase() + m.slice(1)}
                                </label>
                            ))}
                        </div>
                    </div>

                    {data.payment_method === "bank" && (
                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Bank</label>
                            <select value={data.bank_id} onChange={e => setData("bank_id", e.target.value)} className="w-full border rounded px-3 py-2">
                                <option value="">-- Select Bank --</option>
                                {banks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    )}

                    {data.payment_method === "mobile" && (
                        <div className="mb-4">
                            <label className="block mb-1 font-medium">Mobile Financial Service</label>
                            <select value={data.mfs} onChange={e => setData("mfs", e.target.value)} className="w-full border rounded px-3 py-2">
                                <option value="">-- Select MFS --</option>
                                <option value="bkash">Bkash</option>
                                <option value="nagad">Nagad</option>
                                <option value="rocket">Rocket</option>
                            </select>
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block mb-1 font-medium">Payment Amount</label>
                        <input type="number" value={data.payment_amount} onChange={e => setData("payment_amount", e.target.value)} className="w-full border rounded px-3 py-2"/>
                    </div>

                    <div className="mb-4">
                        <p className="font-medium">Total Price: {totalPrice}</p>
                    </div>

                    <button type="submit" disabled={processing} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Update Order</button>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
