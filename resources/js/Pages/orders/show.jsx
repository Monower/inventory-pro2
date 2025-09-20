import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link } from "@inertiajs/react";

const Show = ({ order }) => {
    const totalPrice = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <AuthenticatedLayout>
            <section className="max-w-7xl mx-auto p-4 md:p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold">Order Details: {order.order_number}</h3>
                    <Link
                        href="/orders"
                        className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600"
                    >
                        Back to Orders
                    </Link>
                </div>

                {/* Customer Info */}
                <div className="bg-white shadow-md rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold mb-2">Customer Information</h4>
                    <p><strong>Name:</strong> {order.customer.name}</p>
                    <p><strong>Email:</strong> {order.customer.email || "-"}</p>
                    <p><strong>Phone:</strong> {order.customer.phone || "-"}</p>
                </div>

                {/* Order Items */}
                <div className="bg-white shadow-md rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold mb-4">Products in Order</h4>
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-3 py-2">Product Name</th>
                                <th className="px-3 py-2">Unit Price</th>
                                <th className="px-3 py-2">Quantity</th>
                                <th className="px-3 py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map(item => (
                                <tr key={item.id} className="border-b hover:bg-gray-50">
                                    <td className="px-3 py-2">{item.product.name}</td>
                                    <td className="px-3 py-2">{item.price}</td>
                                    <td className="px-3 py-2">{item.quantity}</td>
                                    <td className="px-3 py-2">{item.price * item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-100 font-semibold">
                                <td className="px-3 py-2 text-right" colSpan={3}>Total:</td>
                                <td className="px-3 py-2">{totalPrice}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Payment Info */}
                <div className="bg-white shadow-md rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-2">Payment Information</h4>
                    <p><strong>Paid Amount:</strong> {order.paid_amount}</p>
                    <p><strong>Pending Amount:</strong> {order.due_amount}</p>
                    <p><strong>Payment Status:</strong> 
                        <span className={`ml-2 px-2 py-1 rounded text-white ${order.payment_status === 'paid' ? 'bg-green-600' : order.payment_status === 'partial' ? 'bg-yellow-500' : 'bg-red-500'}`}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                        </span>
                    </p>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Show;
