import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";

const Edit = ({ customer }) => {
    const { data, setData, post, processing, errors, put: update } = useForm({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        update(route('customer.update', customer.id));
    };

    return (
        <AuthenticatedLayout>
            <div>
                <div>
                    <h1 className="text-xl font-semibold">Update Customer</h1>
                </div>

                <div>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">
                            <fieldset className="border border-gray-300 bg-white">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">Name</label>
                                </legend>
                                <input
                                    value={data.name}
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
                                    value={data.email}
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
                                    value={data.phone}
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
                                    value={data.address}
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
                                Update
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    )
};


export default Edit;