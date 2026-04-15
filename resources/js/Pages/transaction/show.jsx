import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Head, Link, usePage } from "@inertiajs/react";
import { dateFormater, dateTimeFormater } from "@/util/DateFormater";

const money = (value) => Number(value || 0).toFixed(2);

const formatValue = (value) => value || "N/A";

const formatPaymentMethod = (value) => {
    const labels = {
        cash: "Cash",
        bank: "Bank",
        mobileBanking: "Mobile banking",
    };

    return labels[value] || formatValue(value);
};

const formatTransactionType = (value) => {
    const labels = {
        add_money: "Add money",
        expense: "Expense",
    };

    return labels[value] || formatValue(value);
};

const DetailItem = ({ label, value }) => (
    <div className="rounded-lg border border-slate-200 p-4 dark:border-slate-700">
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
        <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
            {value}
        </p>
    </div>
);

const Show = ({ transaction }) => {
    const { company_name } = usePage().props;
    const typeLabel = formatTransactionType(transaction?.transaction_type);
    const sourceLabel =
        transaction?.transaction_type === "expense" ? "Destination" : "Source";
    const sourceValue =
        transaction?.transaction_type === "expense"
            ? transaction?.destination || transaction?.source
            : transaction?.source;

    return (
        <AuthenticatedLayout>
            <Head title={`Transaction details - ${company_name}`} />

            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <BackButton url={"transactions.index"} />
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                    {typeLabel}
                                </p>
                                <h3 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                    {transaction?.name}
                                </h3>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                    Review payment method, {sourceLabel.toLowerCase()}, amount, and reference details.
                                </p>
                            </div>
                        </div>

                        <Link
                            href={route("transaction.edit", transaction.id)}
                            className="edit-button text-center"
                        >
                            Edit transaction
                        </Link>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                Transaction information
                            </h4>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                                Recorded transaction #{transaction?.id}
                            </p>
                        </div>
                        <div className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                            Tk {money(transaction?.amount)}
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                        <DetailItem label="Name" value={formatValue(transaction?.name)} />
                        <DetailItem label="Transaction type" value={typeLabel} />
                        <DetailItem
                            label="Payment method"
                            value={formatPaymentMethod(transaction?.payment_method)}
                        />
                        <DetailItem
                            label="Transaction date"
                            value={
                                transaction?.transaction_date
                                    ? dateFormater(transaction.transaction_date)
                                    : "N/A"
                            }
                        />
                        <DetailItem label={sourceLabel} value={formatValue(sourceValue)} />
                        <DetailItem label="Amount" value={`Tk ${money(transaction?.amount)}`} />
                        <DetailItem label="Bank name" value={formatValue(transaction?.bank_name)} />
                        <DetailItem
                            label="Branch name"
                            value={formatValue(transaction?.branch_name)}
                        />
                        <DetailItem
                            label="Transaction ID"
                            value={formatValue(transaction?.transaction_id)}
                        />
                        <DetailItem
                            label="Created at"
                            value={
                                transaction?.created_at
                                    ? dateTimeFormater(transaction.created_at)
                                    : "N/A"
                            }
                        />
                        <DetailItem
                            label="Updated at"
                            value={
                                transaction?.updated_at
                                    ? dateTimeFormater(transaction.updated_at)
                                    : "N/A"
                            }
                        />
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Show;
