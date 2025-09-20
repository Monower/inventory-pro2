import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";

const Index = ({ orders }) => {
    const { delete: destroy, processing } = useForm();

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this order?")) {
            destroy(route("orders.destroy", id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <AuthenticatedLayout>
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Orders</h3>
                    <Link
                        href={route("orders.create")}
                        className="bg-blue-500 text-white p-1 px-2 rounded"
                    >
                        Create
                    </Link>
                </div>

                <div className="bg-white p-4 rounded shadow">
                    <table className="w-full border-separate border-spacing-y-2 text-sm text-left">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-3 py-2">SI</th>
                                <th className="px-3 py-2">Order Number</th>
                                <th className="px-3 py-2">Customer Name</th>
                                <th className="px-3 py-2">Total Amount</th>
                                <th className="px-3 py-2">Paid Amount</th>
                                <th className="px-3 py-2">Due Amount</th>
                                <th className="px-3 py-2">Payment Status</th>
                                <th className="px-3 py-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="text-center py-4 text-gray-500"
                                    >
                                        No orders found.
                                    </td>
                                </tr>
                            ) : (
                                orders.map((order, index) => (
                                    <tr
                                        key={order.id}
                                        className="bg-gray-50 hover:bg-gray-100"
                                    >
                                        <td className="px-3 py-2">{index + 1}</td>
                                        <td className="px-3 py-2">{order.order_number}</td>
                                        <td className="px-3 py-2">
                                            {order.customer?.name || "-"}
                                        </td>
                                        <td className="px-3 py-2">{order.total_amount}</td>
                                        <td className="px-3 py-2">{order.paid_amount}</td>
                                        <td className="px-3 py-2">{order.due_amount}</td>
                                        <td className="px-3 py-2 capitalize">
                                            {order.payment_status}
                                        </td>
                                        <td className="px-3 py-2 flex gap-2">
                                            <Link
                                                // href={""}
                                                href={route("orders.show", order.id)}
                                                className="bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600"
                                            >
                                                View
                                            </Link>
                                            {/* <Link
                                                href={route("orders.edit", order.id)}
                                                className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                                            >
                                                Edit
                                            </Link> */}
                                            <button
                                                onClick={() => handleDelete(order.id)}
                                                disabled={processing}
                                                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
