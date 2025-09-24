import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";

const Create = () => {
    const { data, setData, post, errors } = useForm({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("customer.store"));
    };

    return (
        <AuthenticatedLayout>
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"customers.index"} />
                    <h3 className="text-xl font-semibold">Add new customer</h3>
                </div>

                <div>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">
                            <fieldset className="border border-gray-300 bg-white">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">Name</label>
                                </legend>
                                <input
                                    type="text"
                                    name="name"
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter customer name"
                                />
                            </fieldset>
                            <fieldset className="border border-gray-300 bg-white">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">Email</label>
                                </legend>
                                <input
                                    type="email"
                                    name="email"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter customer email"
                                />
                            </fieldset>
                            <fieldset className="border border-gray-300 bg-white">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">Phone</label>
                                </legend>
                                <input
                                    type="number"
                                    name="phone"
                                    onChange={(e) =>
                                        setData("phone", e.target.value)
                                    }
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter customer phone"
                                />
                            </fieldset>
                            <fieldset className="border border-gray-300 bg-white">
                                <legend className="text-sm mx-2">
                                    <label>Address</label>
                                </legend>
                                <textarea
                                    name="address"
                                    onChange={(e) =>
                                        setData("address", e.target.value)
                                    }
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter customer address"
                                ></textarea>
                            </fieldset>
                        </div>

                        <div className="w-full flex justify-end">
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
