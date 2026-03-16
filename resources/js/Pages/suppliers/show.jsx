import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Link } from "@inertiajs/react";
import { dateTimeFormater } from "@/util/DateFormater";

const Show = ({ supplier, purchases = [], payments = [], summary }) => {
    return (
        <AuthenticatedLayout title="Supplier Details">
            <section>
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <BackButton url={"suppliers.index"} />
                        <h3 className="heading">Supplier: {supplier.name}</h3>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route("suppliers.edit", supplier.id)} className="edit-button">
                            Edit Supplier
                        </Link>
                        <Link href={route("suppliers.payments.create", supplier.id)} className="create-button">
                            Pay Due
                        </Link>
                    </div>
                </div>

                <div className="mb-6 grid gap-4 rounded-lg border border-ring bg-background p-4 shadow-md md:grid-cols-4">
                    <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{supplier.phone || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{supplier.email || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Contact Person</p>
                        <p className="font-medium">{supplier.contact_person || "N/A"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium">{supplier.is_active ? "Active" : "Inactive"}</p>
                    </div>
                </div>

                <div className="mb-6 grid gap-4 md:grid-cols-4">
                    <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                        <p className="text-sm text-muted-foreground">Purchases</p>
                        <p className="text-2xl font-semibold">{summary.purchase_count}</p>
                    </div>
                    <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                        <p className="text-sm text-muted-foreground">Total Purchase</p>
                        <p className="text-2xl font-semibold">{Number(summary.total_purchase_amount).toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                        <p className="text-sm text-muted-foreground">Total Paid</p>
                        <p className="text-2xl font-semibold">{Number(summary.total_paid_amount).toFixed(2)}</p>
                    </div>
                    <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                        <p className="text-sm text-muted-foreground">Total Due</p>
                        <p className="text-2xl font-semibold">{Number(summary.total_due_amount).toFixed(2)}</p>
                    </div>
                </div>

                <div className="mb-6 rounded-lg border border-ring bg-background p-4 shadow-md">
                    <h4 className="mb-4 text-lg font-semibold">Purchase History</h4>
                    <div className="overflow-x-auto">
                        <table className="custom-table min-w-[860px]">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">Invoice</th>
                                    <th className="custom-th">Branch</th>
                                    <th className="custom-th">Date</th>
                                    <th className="custom-th">Total</th>
                                    <th className="custom-th">Paid</th>
                                    <th className="custom-th rounded-r-md">Due</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.length ? purchases.map((purchase) => (
                                    <tr key={purchase.id} className="custom-body-tr">
                                        <td className="custom-body-td">{purchase.invoice_no}</td>
                                        <td className="custom-body-td">{purchase.branch?.name || "N/A"}</td>
                                        <td className="custom-body-td">{purchase.purchase_date}</td>
                                        <td className="custom-body-td">{purchase.total_amount}</td>
                                        <td className="custom-body-td">{purchase.paid_amount}</td>
                                        <td className="custom-body-td">{purchase.due_amount}</td>
                                    </tr>
                                )) : (
                                    <tr className="custom-body-tr">
                                        <td className="custom-body-td text-center" colSpan={6}>No purchases found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                    <h4 className="mb-4 text-lg font-semibold">Payment History</h4>
                    <div className="overflow-x-auto">
                        <table className="custom-table min-w-[960px]">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">Payment No</th>
                                    <th className="custom-th">Purchase</th>
                                    <th className="custom-th">Branch</th>
                                    <th className="custom-th">Date</th>
                                    <th className="custom-th">Method</th>
                                    <th className="custom-th">Amount</th>
                                    <th className="custom-th rounded-r-md">Received By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length ? payments.map((payment) => (
                                    <tr key={payment.id} className="custom-body-tr">
                                        <td className="custom-body-td">{payment.payment_number}</td>
                                        <td className="custom-body-td">{payment.purchase?.invoice_no || "N/A"}</td>
                                        <td className="custom-body-td">{payment.branch?.name || "N/A"}</td>
                                        <td className="custom-body-td">{dateTimeFormater(payment.paid_at)}</td>
                                        <td className="custom-body-td">{payment.payment_method}</td>
                                        <td className="custom-body-td">{payment.amount}</td>
                                        <td className="custom-body-td">{payment.receivedBy?.name || "N/A"}</td>
                                    </tr>
                                )) : (
                                    <tr className="custom-body-tr">
                                        <td className="custom-body-td text-center" colSpan={7}>No payments found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Show;
