import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { useState, useEffect } from "react";
import { useForm, Head } from "@inertiajs/react";
import Alert from "@/Components/Alert/Alert";

const Create = ({ customers, products, banks }) => {
    const [cart, setCart] = useState([]);

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
            alert("Cart is empty.");
            return;
        }
        post("/orders");
    };

    return (
        <AuthenticatedLayout title="Create order">
            {/* <Head title={`Create order - ${company_name}`} /> */}
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"orders.index"} />
                    <div>
                        <h3 className="heading">Create new order</h3>
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

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Products & Cart */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                        <div className="bg-background border border-ring shadow-md rounded-lg p-4">
                            <h3 className="heading">Cart list</h3>
                            {cart.length === 0 ? (
                                <p className="text-gray-500">
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
                    <div className="bg-background border border-ring shadow-md rounded-lg p-4">
                        <h3 className="heading">Checkout</h3>
                        <div className="grid gap-6">
                            {/* Summary */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-background* border border-ring shadow-md py-50 p-4 rounded-lg">
                                <div>
                                    <p className="text-primary">Total price</p>
                                    <h3 className="text-xl font-bold text-primary">
                                        {totalPrice}
                                    </h3>
                                </div>
                                <div>
                                    <p className="text-primary">
                                        Total quantity
                                    </p>
                                    <h3 className="text-xl font-bold text-primary">
                                        {totalQuantity}
                                    </h3>
                                </div>
                            </div>

                            {/* Customer */}
                            <div>
                                <label className="block text-sm font-medium text-primary mb-1 after:content-['_*'] after:text-red-500">
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
                            <div>
                                <label className="block text-sm font-medium text-primary mb-2 after:content-['_*'] after:text-red-500">
                                    Payment method
                                </label>
                                <div className="flex flex-wrap gap-6">
                                    {["cash", "bank", "mobile"].map(
                                        (method) => (
                                            <label
                                                key={method}
                                                className="flex items-center gap-2"
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
                                    <label className="block text-sm font-medium text-primary mb-1">
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                                <label className="block text-sm font-medium text-primary mb-1 after:content-['_*'] after:text-red-500">
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
                            <div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-green-600 text-white w-full md:w-auto px-6 py-2 rounded-lg font-semibold hover:bg-green-700"
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
