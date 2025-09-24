import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";



const Edit = ({ staff }) => {

    const { data, setData, post, errors, put } = useForm({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        address: staff.address,
        salary: staff.salary,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("staff.update", staff.id));
    };


    return (
        <AuthenticatedLayout>
                    <section>
                        <div className="mb-4 flex items-center gap-4">
                            <BackButton url={"staffs.index"} />
                            <h3 className="text-xl font-semibold">Update staff</h3>
                        </div>
        
                        <div>
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">
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
                                            value={data.email}
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
                                            value={data.phone}
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
                                            value={data.salary}
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
                                            value={data.address}
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
        
                                <div className="flex justify-end">
                                    <button className="bg-blue-500 text-white p-1 px-2 rounded">
                                        Update
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                </AuthenticatedLayout>
    )
};


export default Edit;