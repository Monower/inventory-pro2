import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Head, usePage, Link } from "@inertiajs/react";
import { dateTimeFormater } from "@/util/DateFormater";

const getVariantName = (item) =>
    item?.product_variant?.attribute_value?.name || "Standard";

const Show = ({ order }) => {
    const { company_name } = usePage().props;
    const totalPrice = order?.items.reduce(
        (sum, item) => sum + item?.price * item?.quantity,
        0
    );

    return (
        <AuthenticatedLayout>
            <Head title={`View order - ${company_name}`} />
            <section>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <BackButton url={"orders.index"} />
                        <h3 className="heading">
                            Order details of: {order?.order_number}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2">
                        <a
                            href={route("orders.invoice.pdf", order.id)}
                            className="create-button"
                        >
                            Download Invoice
                        </a>
                        <Link
                            href={route("orders.edit", order.id)}
                            className="edit-button"
                            title="Edit"
                        >
                            Edit order
                        </Link>
                    </div>
                </div>

                {/* Order info */}
                <div className="bg-background border border-ring shadow-md rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold mb-2">
                        Order information
                    </h4>
                    <p>
                        <strong>Order ID:</strong>{" "}
                        {order?.order_number || "N/A"}
                    </p>
                    <p>
                        <strong>Created at:</strong>{" "}
                        {dateTimeFormater(order?.created_at) || "N/A"}
                    </p>
                    <p>
                        <strong>Last updated at:</strong>{" "}
                        {dateTimeFormater(order?.updated_at) || "N/A"}
                    </p>
                    <p>
                        <strong>Total amount:</strong>{" "}
                        {order?.total_amount || "00.00"}
                    </p>
                    <p>
                        <strong>Paid amount:</strong>{" "}
                        {order?.paid_amount || "00.00"}
                    </p>
                    <p>
                        <strong>Due amount:</strong>{" "}
                        {order?.due_amount || "00.00"}
                    </p>
                    <p>
                        <strong>Payment status:</strong>
                        <span
                            className={`ml-2 px-2 py-1 rounded text-white ${
                                order?.payment_status === "paid"
                                    ? "bg-green-600"
                                    : order?.payment_status === "partial"
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                            }`}
                        >
                            {order?.payment_status === "pending"
                                ? "Unpaid"
                                : order?.payment_status
                                      .charAt(0)
                                      .toUpperCase() +
                                  order?.payment_status.slice(1)}
                        </span>
                    </p>
                </div>

                {/* Customer info */}
                <div className="bg-background border border-ring shadow-md rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold mb-2">
                        Customer information
                    </h4>
                    <p>
                        <strong>Name:</strong> {order?.customer?.name || "N/A"}
                    </p>
                    <p>
                        <strong>Phone:</strong>{" "}
                        {order?.customer?.phone || "N/A"}
                    </p>
                    <p>
                        <strong>Email:</strong>{" "}
                        {order?.customer?.display_email || "N/A"}
                    </p>
                </div>

                {/* Order Items */}
                <div className="bg-background border border-ring shadow-md rounded-lg p-4 mb-6">
                    <h4 className="text-lg font-semibold mb-4">
                        Products in order
                    </h4>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[640px] text-sm border border-gray-200 rounded-lg">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">
                                        Product name
                                    </th>
                                    <th className="custom-th">Variant</th>
                                    <th className="custom-th">Unit price</th>
                                    <th className="custom-th">Quantity</th>
                                    <th className="custom-th rounded-r-md">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {order?.items?.map((item) => (
                                    <tr key={item.id} className="custom-body-tr">
                                        <td className="custom-body-td">
                                            {item?.product?.name}
                                        </td>
                                        <td className="custom-body-td">
                                            {getVariantName(item)}
                                        </td>
                                        <td className="custom-body-td">
                                            {item?.price}
                                        </td>
                                        <td className="custom-body-td">
                                            {item?.quantity}
                                        </td>
                                        <td className="custom-body-td">
                                            {item?.price * item?.quantity}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr className="custom-body-tr">
                                    <td
                                        className="custom-body-td text-right"
                                        colSpan={4}
                                    >
                                        Total:
                                    </td>
                                    <td className="custom-body-td">{totalPrice}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Show;
