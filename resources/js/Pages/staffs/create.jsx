import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage, Head } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";
import { useState } from "react";
import Alert from "@/Components/Alert/Alert";

const Create = () => {
    const { company_name } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        salary: "",
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
        post(route("staff.store"));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Add Employee - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"staffs.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Add employee
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Create a staff profile with contact details and
                                the employee's base salary.
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
                                        <label className="required-label">
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
