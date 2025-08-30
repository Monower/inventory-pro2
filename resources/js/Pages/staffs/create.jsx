import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";

const Create = () => {
    const { data, setData, post, errors } = useForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        salary: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("staff.store"));
    };

    return (
        <AuthenticatedLayout>
            <section>
                <div className="mb-4">
                    <h3 className="text-xl font-semibold">Add new staff</h3>
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
                                    placeholder="Enter staff name"
                                />
                            </fieldset>
                            <fieldset className="border border-gray-300 bg-white">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Email
                                    </label>
                                </legend>
                                <input
                                    type="email"
                                    name="email"
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter staff email"
                                />
                            </fieldset>
                            <fieldset className="border border-gray-300 bg-white">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Phone
                                    </label>
                                </legend>
                                <input
                                    type="number"
                                    name="phone"
                                    onChange={(e) =>
                                        setData("phone", e.target.value)
                                    }
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter staff phone"
                                />
                            </fieldset>
                            <fieldset className="border border-gray-300 bg-white">
                                <legend className="text-sm mx-2">
                                    <label>
                                        Salary
                                    </label>
                                </legend>
                                <input
                                    type="number"
                                    name="salary"
                                    onChange={(e) =>
                                        setData("salary", e.target.value)
                                    }
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter staff salary"
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
                                    placeholder="Enter staff address"
                                    rows="1"
                                ></textarea>
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
