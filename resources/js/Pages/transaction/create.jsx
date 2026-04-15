import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage, Head } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";
import InputError from "@/Components/InputError";

const Create = () => {
    const { props, url } = usePage();
    const { company_name } = props;
    const searchParams = new URLSearchParams(new URL(url, window.location.origin).search);
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        transaction_date: "",
        paymentMethod: "cash",
        transaction_type: searchParams.get("type") || "add_money",
        source: "",
        destination: "",
        amount: "",
        bank_name: "",
        branch_name: "",
        transaction_id: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("transaction.store"));
    };

    const sourceLabel = data.transaction_type === "expense" ? "Destination" : "Source";
    const sourceField = data.transaction_type === "expense" ? "destination" : "source";

    return (
        <AuthenticatedLayout>
            <Head title={`Create Transaction - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"transactions.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Add new transaction
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Log a new {data.transaction_type === "expense" ? "business expense" : "money addition"} with payment method, {sourceLabel.toLowerCase()}, and amount details.
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
                                <InputError message={errors.name} className="mt-1" />
                            </fieldset>
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label>Transaction date</label>
                                </legend>
                                <input
                                    type="date"
                                    name="transaction_date"
                                    value={data.transaction_date}
                                    onChange={(e) =>
                                        setData("transaction_date", e.target.value)
                                    }
                                    className="custom-input"
                                />
                                <InputError message={errors.transaction_date} className="mt-1" />
                            </fieldset>
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Payment method
                                    </label>
                                </legend>
                                <select
                                    value={data.paymentMethod}
                                    name="paymentMethod"
                                    onChange={(e) => setData("paymentMethod", e.target.value)}
                                    className="custom-input"
                                >
                                    <option value="cash">Cash</option>
                                    <option value="bank">Bank</option>
                                    <option value="mobileBanking">Mobile banking</option>
                                </select>
                                <InputError message={errors.paymentMethod} className="mt-1" />
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
                                    <label>{sourceLabel}</label>
                                </legend>
                                <input
                                    value={data[sourceField]}
                                    type="text"
                                    name={sourceField}
                                    onChange={(e) =>
                                        setData(sourceField, e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder={`Enter ${sourceLabel.toLowerCase()} name`}
                                />
                                <InputError message={errors[sourceField]} className="mt-1" />
                            </fieldset>
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Amount
                                    </label>
                                </legend>
                                <input
                                    value={data.amount}
                                    type="number"
                                    name="amount"
                                    step="0.01"
                                    min="0"
                                    onChange={(e) =>
                                        setData("amount", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter amount"
                                />
                                <InputError message={errors.amount} className="mt-1" />
                            </fieldset>
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label>Bank name</label>
                                </legend>
                                <input
                                    type="text"
                                    name="bank_name"
                                    value={data.bank_name}
                                    onChange={(e) =>
                                        setData("bank_name", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter bank name"
                                />
                                <InputError message={errors.bank_name} className="mt-1" />
                            </fieldset>
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label>Branch name</label>
                                </legend>
                                <input
                                    type="text"
                                    name="branch_name"
                                    value={data.branch_name}
                                    onChange={(e) =>
                                        setData("branch_name", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter branch name"
                                />
                                <InputError message={errors.branch_name} className="mt-1" />
                            </fieldset>
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label>Transaction ID</label>
                                </legend>
                                <input
                                    type="text"
                                    name="transaction_id"
                                    value={data.transaction_id}
                                    onChange={(e) =>
                                        setData("transaction_id", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter transaction ID"
                                />
                                <InputError message={errors.transaction_id} className="mt-1" />
                            </fieldset>
                        </div>
                        <InputError message={errors.transaction_type} className="mb-4" />

                        <div className="flex justify-end">
                            <button className="create-button" disabled={processing}>
                                {processing ? "Saving..." : "Save"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Create;
