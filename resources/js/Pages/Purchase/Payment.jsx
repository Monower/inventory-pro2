import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";

export default function Payment({ purchase, banks = [] }) {
    const defaultPaidAt = (() => {
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;

        return new Date(now.getTime() - timezoneOffset)
            .toISOString()
            .slice(0, 16);
    })();

    const { data, setData, post, processing, errors } = useForm({
        paid_at: defaultPaidAt,
        amount: purchase.due_amount,
        payment_method: "cash",
        bank_id: "",
        mfs: "",
        notes: "",
    });

    const handleSubmit = (event) => {
        event.preventDefault();
        post(route("purchases.payments.store", purchase.id));
    };

    return (
        <AuthenticatedLayout title="Purchase Payment">
            <section>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link
                            href={route("purchases.show", purchase.id)}
                            className="text-sm text-primary underline-offset-4 hover:underline"
                        >
                            Back to purchase
                        </Link>
                        <h3 className="heading">Pay due for {purchase.invoice_no}</h3>
                    </div>
                    <div className="text-sm text-muted-foreground">
                        Outstanding amount: {Number(purchase.due_amount).toFixed(2)}
                    </div>
                </div>

                <div className="mb-6 grid gap-4 rounded-lg border border-ring bg-background p-4 shadow-md md:grid-cols-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Supplier</p>
                        <p className="font-medium">{purchase.supplier?.name || purchase.supplier_name || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Branch</p>
                        <p className="font-medium">{purchase.branch?.name || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Paid amount</p>
                        <p className="font-medium">{Number(purchase.paid_amount).toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Due amount</p>
                        <p className="font-medium">{Number(purchase.due_amount).toFixed(2)}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm">
                                    <label className="required-label">Payment date</label>
                                </legend>
                                <input
                                    type="datetime-local"
                                    value={data.paid_at}
                                    onChange={(event) => setData("paid_at", event.target.value)}
                                    className="custom-input"
                                    required
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.paid_at}</small>
                        </div>

                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm">
                                    <label className="required-label">Amount</label>
                                </legend>
                                <input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    max={purchase.due_amount}
                                    value={data.amount}
                                    onChange={(event) => setData("amount", event.target.value)}
                                    className="custom-input"
                                    required
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.amount}</small>
                        </div>

                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm">
                                    <label className="required-label">Payment method</label>
                                </legend>
                                <select
                                    value={data.payment_method}
                                    onChange={(event) => setData("payment_method", event.target.value)}
                                    className="custom-input"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="bank">Bank</option>
                                    <option value="mobile">Mobile banking</option>
                                </select>
                            </fieldset>
                            <small className="text-destructive">{errors.payment_method}</small>
                        </div>

                        {data.payment_method === "bank" && (
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

                        {data.payment_method === "mobile" && (
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
                                    <label>Notes</label>
                                </legend>
                                <textarea
                                    value={data.notes}
                                    onChange={(event) => setData("notes", event.target.value)}
                                    className="custom-input resize-none"
                                    rows={3}
                                    placeholder="Optional note for this supplier payment"
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.notes}</small>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link
                            href={route("purchases.show", purchase.id)}
                            className="rounded-md border border-ring px-4 py-2 text-sm"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={processing}
                            className="create-button"
                        >
                            {processing ? "Saving..." : "Pay due"}
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
}
