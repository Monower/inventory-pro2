import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";

const Payment = ({ supplier, banks, openPurchases = [] }) => {
    const defaultPaidAt = (() => {
        const now = new Date();
        const timezoneOffset = now.getTimezoneOffset() * 60000;

        return new Date(now.getTime() - timezoneOffset)
            .toISOString()
            .slice(0, 16);
    })();

    const { data, setData, post, processing, errors } = useForm({
        purchase_id: "",
        paid_at: defaultPaidAt,
        amount: "",
        payment_method: "cash",
        bank_id: "",
        mfs: "",
        notes: "",
    });

    const selectedPurchase = openPurchases.find(
        (purchase) => String(purchase.id) === String(data.purchase_id)
    );

    const handleSubmit = (event) => {
        event.preventDefault();
        post(route("suppliers.payments.store", supplier.id));
    };

    return (
        <AuthenticatedLayout title="Pay Supplier Due">
            <section>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link href={route("suppliers.show", supplier.id)} className="text-sm text-primary underline-offset-4 hover:underline">
                            Back to supplier
                        </Link>
                        <h3 className="heading">Pay due for {supplier.name}</h3>
                    </div>
                    {selectedPurchase && (
                        <div className="text-sm text-muted-foreground">
                            Selected due: {Number(selectedPurchase.due_amount).toFixed(2)}
                        </div>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm"><label>Purchase</label></legend>
                                <select value={data.purchase_id} onChange={(e) => {
                                    const nextId = e.target.value;
                                    const purchase = openPurchases.find((item) => String(item.id) === String(nextId));
                                    setData("purchase_id", nextId);
                                    if (purchase) {
                                        setData("amount", purchase.due_amount);
                                    }
                                }} className="custom-input">
                                    <option value="">Auto-settle oldest due purchases</option>
                                    {openPurchases.map((purchase) => (
                                        <option key={purchase.id} value={purchase.id}>
                                            {purchase.invoice_no} - Due {purchase.due_amount}
                                        </option>
                                    ))}
                                </select>
                            </fieldset>
                            <small className="text-destructive">{errors.purchase_id}</small>
                        </div>
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm"><label className="required-label">Payment date</label></legend>
                                <input type="datetime-local" value={data.paid_at} onChange={(e) => setData("paid_at", e.target.value)} className="custom-input" />
                            </fieldset>
                            <small className="text-destructive">{errors.paid_at}</small>
                        </div>
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm"><label className="required-label">Amount</label></legend>
                                <input type="number" min="0.01" step="0.01" value={data.amount} onChange={(e) => setData("amount", e.target.value)} className="custom-input" />
                            </fieldset>
                            <small className="text-destructive">{errors.amount}</small>
                        </div>
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm"><label className="required-label">Payment method</label></legend>
                                <select value={data.payment_method} onChange={(e) => setData("payment_method", e.target.value)} className="custom-input">
                                    <option value="cash">Cash</option>
                                    <option value="bank">Bank</option>
                                    <option value="mobile">Mobile banking</option>
                                </select>
                            </fieldset>
                        </div>

                        {data.payment_method === "bank" && (
                            <div>
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-2 text-sm"><label className="required-label">Bank</label></legend>
                                    <select value={data.bank_id} onChange={(e) => setData("bank_id", e.target.value)} className="custom-input">
                                        <option value="">Select bank</option>
                                        {banks.map((bank) => (
                                            <option key={bank.id} value={bank.id}>{bank.name}</option>
                                        ))}
                                    </select>
                                </fieldset>
                                <small className="text-destructive">{errors.bank_id}</small>
                            </div>
                        )}

                        {data.payment_method === "mobile" && (
                            <div>
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-2 text-sm"><label className="required-label">Mobile service</label></legend>
                                    <select value={data.mfs} onChange={(e) => setData("mfs", e.target.value)} className="custom-input">
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
                                <legend className="mx-2 text-sm"><label>Notes</label></legend>
                                <textarea value={data.notes} onChange={(e) => setData("notes", e.target.value)} className="custom-input resize-none" rows={3} />
                            </fieldset>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href={route("suppliers.show", supplier.id)} className="rounded-md border border-ring px-4 py-2 text-sm">
                            Cancel
                        </Link>
                        <button type="submit" disabled={processing} className="create-button">
                            {processing ? "Saving..." : "Record payment"}
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Payment;
