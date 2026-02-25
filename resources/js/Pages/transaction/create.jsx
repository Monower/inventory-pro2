import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage, Head } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";

const Create = () => {
    const { url, company_name } = usePage();
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

    return (
        <AuthenticatedLayout>
            <Head title={`Create Transaction - ${company_name}`} />
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"transactions.index"} />
                    <h3 className="text-xl font-semibold">Add new transaction</h3>
                </div>

                <div>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                            <fieldset className="custom-fieldset p-2">
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
                                    className="custom-input"
                                    placeholder="Enter transaction name"
                                />
                            </fieldset>
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Payment method
                                    </label>
                                </legend>
                                <select name="paymentMethod" onChange={(e) => setData("paymentMethod", e.target.value)} className="custom-input">
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
                                    type="number"
                                    name="amount"
                                    onChange={(e) =>
                                        setData("amount", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter amount"
                                />
                            </fieldset>
                        </div>

                        <div>
                            <button className="create-button">
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
