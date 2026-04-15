import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage, Head } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";

const Edit = ({ transaction }) => {
    const { company_name } = usePage();
    const { data, setData, post, errors, put } = useForm({
        name: transaction.name,
        transaction_date: transaction.transaction_date || "",
        paymentMethod: transaction.payment_method,
        transaction_type: transaction.transaction_type,
        source: transaction.source,
        amount: transaction.amount,
        bank_name: transaction.bank_name || "",
        branch_name: transaction.branch_name || "",
        transaction_id: transaction.transaction_id || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("transaction.update", transaction.id));
    };


    return (
        <AuthenticatedLayout>
            <Head title={`Edit Transaction - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"transactions.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Update transaction
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Adjust the transaction details while preserving the recorded type and payment context.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Name
                                    </label>
                                </legend>
                                <input
                                    value={data.name}
                                    type="text"
                                    name="name"
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter transaction name"
                                />
                            </fieldset>
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label>Transaction date</label>
                                </legend>
                                <input
                                    value={data.transaction_date}
                                    type="date"
                                    name="transaction_date"
                                    onChange={(e) =>
                                        setData("transaction_date", e.target.value)
                                    }
                                    className="custom-input"
                                />
                            </fieldset>
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Payment method
                                    </label>
                                </legend>
                                <select value={data.paymentMethod} name="paymentMethod" onChange={(e) => setData("paymentMethod", e.target.value)} className="custom-input">
                                    <option value="cash">Cash</option>
                                    <option value="bank">Bank</option>
                                    <option value="mobileBanking">Mobile banking</option>
                                </select>
                                {/* <input
                                    type="text"
                                    name="paymentMethod"
                                    onChange={(e) =>
                                        setData("paymentMethod", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter payment method"
                                /> */}
                            </fieldset>
                            {/* <fieldset className="border border-gray-300 bg-white">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Transaction type
                                    </label>
                                </legend>
                                <input
                                    type="text"
                                    name="transaction_type"
                                    onChange={(e) =>
                                        setData("transaction_type", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter transaction type"
                                />
                            </fieldset> */}
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label>Source</label>
                                </legend>
                                <input
                                    value={data.source}
                                    type="text"
                                    name="source"
                                    onChange={(e) =>
                                        setData("source", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter source name"
                                />
                            </fieldset>
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label>Amount</label>
                                </legend>
                                <input
                                    value={data.amount}
                                    type="number"
                                    name="amount"
                                    onChange={(e) =>
                                        setData("amount", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter amount"
                                />
                            </fieldset>
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label>Bank name</label>
                                </legend>
                                <input
                                    value={data.bank_name}
                                    type="text"
                                    name="bank_name"
                                    onChange={(e) =>
                                        setData("bank_name", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter bank name"
                                />
                            </fieldset>
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label>Branch name</label>
                                </legend>
                                <input
                                    value={data.branch_name}
                                    type="text"
                                    name="branch_name"
                                    onChange={(e) =>
                                        setData("branch_name", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter branch name"
                                />
                            </fieldset>
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label>Transaction ID</label>
                                </legend>
                                <input
                                    value={data.transaction_id}
                                    type="text"
                                    name="transaction_id"
                                    onChange={(e) =>
                                        setData("transaction_id", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter transaction ID"
                                />
                            </fieldset>
                        </div>

                        <div className="flex justify-end">
                            <button className="edit-button">
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
