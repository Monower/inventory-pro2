import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage } from "@inertiajs/react";

const Create = () => {
    const { url } = usePage();
    const searchParams = new URLSearchParams(new URL(url, window.location.origin).search);
    const { data, setData, post, errors } = useForm({
        name: "",
        paymentMethod: "cash",
        transaction_type: searchParams.get("type") || "",
        source: "",
        amount: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("transaction.store"));
    };


    console.log('transaction data: ',data)

    return (
        <AuthenticatedLayout>
            <section>
                <div className="mb-4">
                    <h3 className="text-xl font-semibold">Add new transaction</h3>
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
                                <select name="paymentMethod" onChange={(e) => setData("paymentMethod", e.target.value)} className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm">
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
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Create;
