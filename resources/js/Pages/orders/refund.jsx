import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";

const Refund = ({ order, items, banks, products }) => {
    const defaultRefundedAt = (() => {
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;

        return new Date(now.getTime() - timezoneOffset)
            .toISOString()
            .slice(0, 16);
    })();

    const { data, setData, post, processing, errors } = useForm({
        refunded_at: defaultRefundedAt,
        resolution_type: "refund",
        refund_method: order.payment_method || "cash",
        bank_id: "",
        mfs: "",
        reason: "",
        notes: "",
        items: items.map((item) => ({
            order_item_id: item.order_item_id,
            quantity: 0,
            restock_to_inventory: true,
        })),
        exchange_items: [
            {
                product_id: "",
                quantity: 1,
            },
        ],
    });

    const totalsByItem = items.map((item, index) => {
        const quantity = Number(data.items[index]?.quantity || 0);

        return quantity * Number(item.unit_price || 0);
    });

    const selectedTotal = totalsByItem.reduce((sum, amount) => sum + amount, 0);
    const exchangeTotals = data.exchange_items.map((exchangeItem) => {
        const product = products.find(
            (item) => String(item.id) === String(exchangeItem.product_id)
        );

        if (!product) {
            return 0;
        }

        return Number(product.selling_price || 0) * Number(exchangeItem.quantity || 0);
    });
    const replacementTotal = exchangeTotals.reduce((sum, amount) => sum + amount, 0);

    const updateItem = (index, key, value) => {
        setData(
            "items",
            data.items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [key]: value } : item
            )
        );
    };

    const updateExchangeItem = (index, key, value) => {
        setData(
            "exchange_items",
            data.exchange_items.map((item, itemIndex) =>
                itemIndex === index ? { ...item, [key]: value } : item
            )
        );
    };

    const addExchangeItem = () => {
        setData("exchange_items", [
            ...data.exchange_items,
            { product_id: "", quantity: 1 },
        ]);
    };

    const removeExchangeItem = (index) => {
        if (data.exchange_items.length === 1) {
            updateExchangeItem(0, "product_id", "");
            updateExchangeItem(0, "quantity", 1);
            return;
        }

        setData(
            "exchange_items",
            data.exchange_items.filter((_, itemIndex) => itemIndex !== index)
        );
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        post(route("orders.refunds.store", order.id));
    };

    return (
        <AuthenticatedLayout title="Refund Order">
            <section>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route("orders.show", order.id)}
                            className="text-sm text-primary underline-offset-4 hover:underline"
                        >
                            Back to order
                        </Link>
                        <h3 className="heading">Return case for {order.order_number}</h3>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Returnable paid amount: {Number(order.refundable_amount).toFixed(2)}
                    </div>
                </div>

                <div className="mb-6 grid gap-4 rounded-lg border border-ring bg-background p-4 shadow-md md:grid-cols-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Customer</p>
                        <p className="font-medium">{order.customer?.name || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{order.customer?.phone || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Paid amount</p>
                        <p className="font-medium">{Number(order.paid_amount).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Already refunded</p>
                        <p className="font-medium">{Number(order.refunded_amount).toFixed(2)}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm">
                                    <label className="required-label">Refund date</label>
                                </legend>
                                <input
                                    type="datetime-local"
                                    value={data.refunded_at}
                                    onChange={(event) =>
                                        setData("refunded_at", event.target.value)
                                    }
                                    className="custom-input"
                                    required
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.refunded_at}</small>
                        </div>

                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm">
                                    <label className="required-label">Case type</label>
                                </legend>
                                <select
                                    value={data.resolution_type}
                                    onChange={(event) =>
                                        setData("resolution_type", event.target.value)
                                    }
                                    className="custom-input"
                                >
                                    <option value="refund">Refund</option>
                                    <option value="return_only">Return only</option>
                                    <option value="exchange">Exchange</option>
                                </select>
                            </fieldset>
                            <small className="text-destructive">{errors.resolution_type}</small>
                        </div>

                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm">
                                    <label className="required-label">
                                        {data.resolution_type === "refund"
                                            ? "Refund method"
                                            : "Settlement method"}
                                    </label>
                                </legend>
                                <select
                                    value={data.refund_method}
                                    onChange={(event) => setData("refund_method", event.target.value)}
                                    className="custom-input"
                                    disabled={data.resolution_type !== "refund"}
                                >
                                    <option value="original">Original method</option>
                                    <option value="cash">Cash</option>
                                    <option value="bank">Bank</option>
                                    <option value="mobile">Mobile banking</option>
                                </select>
                            </fieldset>
                            <small className="text-destructive">{errors.refund_method}</small>
                        </div>

                        {data.resolution_type === "refund" &&
                            data.refund_method === "bank" && (
                            <div>
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-2 text-sm">
                                        <label className="required-label">Bank</label>
                                    </legend>
                                    <select
                                        value={data.bank_id}
                                        onChange={(event) => setData("bank_id", event.target.value)}
                                        className="custom-input"
                                    >
                                        <option value="">Select bank</option>
                                        {banks.map((bank) => (
                                            <option key={bank.id} value={bank.id}>
                                                {bank.name}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                                <small className="text-destructive">{errors.bank_id}</small>
                            </div>
                        )}

                        {data.resolution_type === "refund" &&
                            data.refund_method === "mobile" && (
                            <div>
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-2 text-sm">
                                        <label className="required-label">Mobile service</label>
                                    </legend>
                                    <select
                                        value={data.mfs}
                                        onChange={(event) => setData("mfs", event.target.value)}
                                        className="custom-input"
                                    >
                                        <option value="">Select service</option>
                                        <option value="bkash">bKash</option>
                                        <option value="nagad">Nagad</option>
                                        <option value="rocket">Rocket</option>
                                    </select>
                                </fieldset>
                                <small className="text-destructive">{errors.mfs}</small>
                            </div>
                        )}

                        <div className="lg:col-span-2">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm">
                                    <label>Reason</label>
                                </legend>
                                <textarea
                                    value={data.reason}
                                    onChange={(event) => setData("reason", event.target.value)}
                                    className="custom-input resize-none"
                                    rows={2}
                                    placeholder="Reason for the refund"
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.reason}</small>
                        </div>

                        <div className="lg:col-span-2">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm">
                                    <label>Notes</label>
                                </legend>
                                <textarea
                                    value={data.notes}
                                    onChange={(event) => setData("notes", event.target.value)}
                                    className="custom-input resize-none"
                                    rows={3}
                                    placeholder="Internal notes for audit and support"
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.notes}</small>
                        </div>
                    </div>

                    <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-lg font-semibold">Refund items</h4>
                            <span className="text-sm text-muted-foreground">
                                Returned value: {selectedTotal.toFixed(2)}
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead className="custom-thead">
                                    <tr>
                                        <th className="custom-th rounded-l-md">Product</th>
                                        <th className="custom-th">Sold</th>
                                        <th className="custom-th">Already refunded</th>
                                        <th className="custom-th">Available</th>
                                        <th className="custom-th">Unit price</th>
                                        <th className="custom-th">Refund qty</th>
                                        <th className="custom-th">Restock</th>
                                        <th className="custom-th rounded-r-md">Line total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr key={item.order_item_id} className="custom-body-tr">
                                            <td className="custom-body-td">{item.product_name}</td>
                                            <td className="custom-body-td">{item.sold_quantity}</td>
                                            <td className="custom-body-td">{item.refunded_quantity}</td>
                                            <td className="custom-body-td">{item.max_quantity}</td>
                                            <td className="custom-body-td">
                                                {Number(item.unit_price).toFixed(2)}
                                            </td>
                                            <td className="custom-body-td">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    max={item.max_quantity}
                                                    value={data.items[index]?.quantity}
                                                    onChange={(event) =>
                                                        updateItem(
                                                            index,
                                                            "quantity",
                                                            Math.min(
                                                                item.max_quantity,
                                                                Math.max(
                                                                    0,
                                                                    Number(event.target.value || 0)
                                                                )
                                                            )
                                                        )
                                                    }
                                                    className="w-20 custom-input"
                                                />
                                            </td>
                                            <td className="custom-body-td">
                                                <input
                                                    type="checkbox"
                                                    checked={data.items[index]?.restock_to_inventory}
                                                    onChange={(event) =>
                                                        updateItem(
                                                            index,
                                                            "restock_to_inventory",
                                                            event.target.checked
                                                        )
                                                    }
                                                />
                                            </td>
                                            <td className="custom-body-td">
                                                {totalsByItem[index].toFixed(2)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <small className="mt-2 block text-destructive">{errors.items}</small>
                    </div>

                    {data.resolution_type === "exchange" && (
                        <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                            <div className="mb-4 flex items-center justify-between">
                                <h4 className="text-lg font-semibold">
                                    Replacement products
                                </h4>
                                <span className="text-sm text-muted-foreground">
                                    Replacement value: {replacementTotal.toFixed(2)}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {data.exchange_items.map((exchangeItem, index) => (
                                    <div
                                        key={index}
                                        className="grid gap-3 rounded-lg border border-ring p-3 md:grid-cols-[2fr_1fr_auto]"
                                    >
                                        <select
                                            value={exchangeItem.product_id}
                                            onChange={(event) =>
                                                updateExchangeItem(
                                                    index,
                                                    "product_id",
                                                    event.target.value
                                                )
                                            }
                                            className="custom-input"
                                        >
                                            <option value="">Select replacement product</option>
                                            {products.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name} (Stock: {product.stock})
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="number"
                                            min="1"
                                            value={exchangeItem.quantity}
                                            onChange={(event) =>
                                                updateExchangeItem(
                                                    index,
                                                    "quantity",
                                                    Math.max(
                                                        1,
                                                        Number(event.target.value || 1)
                                                    )
                                                )
                                            }
                                            className="custom-input"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeExchangeItem(index)}
                                            className="delete-button"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-3 flex items-center justify-between">
                                <button
                                    type="button"
                                    onClick={addExchangeItem}
                                    className="edit-button"
                                >
                                    Add replacement item
                                </button>
                                <span className="text-sm text-muted-foreground">
                                    Returned value must cover replacement value.
                                </span>
                            </div>
                            <small className="mt-2 block text-destructive">
                                {errors.exchange_items}
                            </small>
                        </div>
                    )}

                    <div className="flex justify-end gap-3">
                        <Link
                            href={route("orders.show", order.id)}
                            className="rounded-md border border-ring px-4 py-2 text-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="create-button"
                        >
                            {processing ? "Processing..." : "Process return case"}
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Refund;
