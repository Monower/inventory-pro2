import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";

const Create = () => {
    const { setData, post } = useForm({
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
            <section className="px-4">
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"staffs.index"} />
                    <h3 className="heading">Add employee</h3>
                </div>

                <div>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">

                            <fieldset className="custom-fieldset">
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
                                    placeholder="Enter staff name"
                                />
                            </fieldset>

                            <fieldset className="custom-fieldset">
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
                                    className="custom-input"
                                    placeholder="Enter staff email"
                                />
                            </fieldset>

                            <fieldset className="custom-fieldset">
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
                                    className="custom-input"
                                    placeholder="Enter staff phone"
                                />
                            </fieldset>

                            <fieldset className="custom-fieldset">
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
                                    className="custom-input"
                                    placeholder="Enter staff salary"
                                />
                            </fieldset>

                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">
                                    <label>Address</label>
                                </legend>
                                <textarea
                                    name="address"
                                    onChange={(e) =>
                                        setData("address", e.target.value)
                                    }
                                    className="custom-input"
                                    placeholder="Enter staff address"
                                    rows="1"
                                ></textarea>
                            </fieldset>
                        </div>

                        <div className="w-full flex justify-end">
                            <button className="create-button" type="submit">
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