import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage, Head, Link } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";

const Edit = ({ staff }) => {
    const { company_name } = usePage().props;
    const { data, setData, post, errors, put, processing } = useForm({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        address: staff.address,
        salary: staff.salary,
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

        put(route("staff.update", staff.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Update Employee - ${company_name}`} />
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"staffs.index"} />
                    <h3 className="heading">Update employee</h3>
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
                                        value={data.name}
                                        type="text"
                                        name="name"
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
                                        value={data.phone}
                                        type="number"
                                        name="phone"
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
                                        value={data.email}
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
                                        value={data.salary}
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
                                        value={data.address}
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
                            <Link
                                href={route("staffs.index")}
                                className="delete-button mr-2 text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                className="create-button"
                                type="submit"
                                disabled={processing}
                            >
                                {processing ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
