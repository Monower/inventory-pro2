import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Head, usePage } from "@inertiajs/react";

const Show = ({ order }) => {
    const { company_name } = usePage().props;
    const totalPrice = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <AuthenticatedLayout>
            <Head title={`View order - ${company_name}`} />
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"orders.index"} />
                    <h3 className="heading">Order details: {order?.order_number}</h3>
                </div>

                {/* Customer Info */}
                <div className="bg-background border border-ring shadow-md rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold mb-2">Customer Information</h4>
                    <p><strong>Name:</strong> {order.customer.name || "N/A"}</p>
                    <p><strong>Email:</strong> {order.customer.email || "N/A"}</p>
                    <p><strong>Phone:</strong> {order.customer.phone || "N/A"}</p>
                </div>

                {/* Order Items */}
                <div className="bg-background border border-ring shadow-md rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold mb-4">Products in Order</h4>
                    <table className="w-full text-sm border border-gray-200 rounded-lg">
                        <thead className="custom-thead">
                            <tr>
                                <th className="custom-th rounded-l-md">Product Name</th>
                                <th className="custom-th">Unit Price</th>
                                <th className="custom-th">Quantity</th>
                                <th className="custom-th rounded-r-md">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map(item => (
                                <tr key={item.id} className="custom-body-tr">
                                    <td className="custom-body-td">{item.product.name}</td>
                                    <td className="custom-body-td">{item.price}</td>
                                    <td className="custom-body-td">{item.quantity}</td>
                                    <td className="custom-body-td">{item.price * item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="custom-body-tr">
                                <td className="custom-body-td text-right" colSpan={3}>Total:</td>
                                <td className="custom-body-td">{totalPrice}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Payment Info */}
                <div className="bg-background border border-ring shadow-md rounded-lg p-4">
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
