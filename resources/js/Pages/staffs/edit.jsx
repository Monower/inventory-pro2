import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage, Head, Link } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";
import { useState } from "react";
import Alert from "@/Components/Alert/Alert";

const Edit = ({ staff }) => {
    const { company_name } = usePage().props;
    const { data, setData, post, errors, put, processing } = useForm({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        address: staff.address,
        salary: staff.salary,
    });
    const [clientError, setClientError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data?.name?.trim() === "") {
            setClientError("Employee name field is required.");
            return;
        } else if (data?.phone?.trim() === "") {
            setClientError("Employee phone field is required.");
            return;
        }
        setClientError("");
        put(route("staff.update", staff.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Update Employee - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"staffs.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Update employee
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Edit the employee profile while keeping payroll
                                and contact information up to date.
                            </p>
                        </div>
                    </div>
                </div>
                {clientError && <Alert flash={{ error: clientError }} autoHideMs={3000} />}

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">
                            <div>
                                <fieldset className="custom-fieldset">
                                    <legend className="text-sm mx-2">
                                        <label className="required-label">
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
                                        <label className="required-label">
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
