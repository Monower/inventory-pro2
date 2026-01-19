import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage, Head } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";

const Create = () => {
    const { company_name } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        salary: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data?.name?.trim() === "") {
            alert("Employee name field is required.");
            return;
        } else if (data?.phone?.trim() === "") {
            alert("Employee phone field is required.");
            return;
        }

        post(route("staff.store"));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Add Employee - ${company_name}`} />
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"staffs.index"} />
                    <h3 className="heading">Add employee</h3>
                </div>

                <div>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">
                            <div>
                                <fieldset className="custom-fieldset">
                                    <legend className="text-sm mx-2">
                                        <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                            Name
                                        </label>
                                    </legend>
                                    <input
                                        type="text"
                                        name="name"
                                        value={data?.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder="Enter employee name"
                                    />
                                </fieldset>

                                <small className="text-destructive">
                                    {errors.name}
                                </small>
                            </div>

                            <div>
                                <fieldset className="custom-fieldset">
                                    <legend className="text-sm mx-2">
                                        <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                            Phone
                                        </label>
                                    </legend>
                                    <input
                                        type="number"
                                        name="phone"
                                        value={data?.phone}
                                        onChange={(e) =>
                                            setData("phone", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder="Enter employee phone"
                                    />
                                </fieldset>

                                <small className="text-destructive">
                                    {errors.phone}
                                </small>
                            </div>

                            <div>
                                <fieldset className="custom-fieldset">
                                    <legend className="text-sm mx-2">
                                        <label>Email</label>
                                    </legend>
                                    <input
                                        type="email"
                                        name="email"
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder="Enter employee email"
                                    />
                                </fieldset>

                                <small className="text-destructive">
                                    {errors.email}
                                </small>
                            </div>

                            <div>
                                <fieldset className="custom-fieldset">
                                    <legend className="text-sm mx-2">
                                        <label>Salary</label>
                                    </legend>
                                    <input
                                        type="number"
                                        name="salary"
                                        onChange={(e) =>
                                            setData("salary", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder="Enter employee salary"
                                    />
                                </fieldset>

                                <small className="text-destructive">
                                    {errors.salary}
                                </small>
                            </div>

                            <div>
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
                                        placeholder="Enter employee address"
                                        rows="1"
                                    ></textarea>
                                </fieldset>

                                <small className="text-destructive">
                                    {errors.address}
                                </small>
                            </div>
                        </div>

                        <div className="w-full flex justify-end">
                            <button
                                type="submit"
                                className="create-button"
                                disabled={processing}
                            >
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