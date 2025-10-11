import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";

const Edit = ({ transaction }) => {
    const { url } = usePage();
    const searchParams = new URLSearchParams(new URL(url, window.location.origin).search);
    const { data, setData, post, errors, put } = useForm({
        name: transaction.name,
        paymentMethod: transaction.payment_method,
        transaction_type: transaction.transaction_type,
        source: transaction.source,
        amount: transaction.amount,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("transaction.update", transaction.id));
    };


    return (
        <AuthenticatedLayout>
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"transactions.index"} />
                    <h3 className="text-xl font-semibold">Update transaction</h3>
                </div>

                <div>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            <fieldset className="border border-gray-300 bg-white">
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
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter transaction name"
                                />
                            </fieldset>
                            <fieldset className="border border-gray-300 bg-white">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Payment method
                                    </label>
                                </legend>
                                <select value={data.paymentMethod} name="paymentMethod" onChange={(e) => setData("paymentMethod", e.target.value)} className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm">
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
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
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
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter transaction type"
                                />
                            </fieldset> */}
                            <fieldset className="border border-gray-300 bg-white">
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
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter source name"
                                />
                            </fieldset>
                            <fieldset className="border border-gray-300 bg-white">
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
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter amount"
                                />
                            </fieldset>
                        </div>

                        <div>
                            <button className="bg-blue-500 text-white p-1 px-2 rounded">
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
