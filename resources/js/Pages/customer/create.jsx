import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, Head } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";
import { usePage } from "@inertiajs/react";
import { useState } from "react";
import Alert from "@/Components/Alert/Alert";

const Create = () => {
    const { company_name } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        phone: "",
        email: "",
        address: "",
    });
    const [clientError, setClientError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if(data?.phone?.trim() === "") {
            setClientError("Customer phone is required.");
            return;
        }
        setClientError("");
        post(route("customer.store"));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Add customer - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"customers.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Add new customer</h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Create a customer profile with phone, name, email, and address details.</p>
                        </div>
                    </div>
                </div>
                {clientError && <Alert flash={{ error: clientError }} autoHideMs={3000} />}

                {/* Form */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">

                            {/* Phone */}
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
                                        onChange={(e) =>
                                            setData("phone", e.target.value)
                                        }
                                        value={data.phone}
                                        className="custom-input"
                                        placeholder="Enter customer phone"
                                        required
                                    />
                                </fieldset>
                                <small className="text-destructive">
                                    {errors.phone}
                                </small>
                            </div>

                            {/* Name */}
                            <div>
                                <fieldset className="custom-fieldset">
                                    <legend className="text-sm mx-2">
                                        <label>
                                            Name
                                        </label>
                                    </legend>
                                    <input
                                        type="text"
                                        name="name"
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        value={data.name}
                                        className="custom-input"
                                        placeholder="Enter customer name"
                                    />
                                </fieldset>
                                <small className="text-destructive">
                                    {errors.name}
                                </small>
                            </div>

                            

                            {/* Email */}
                            <div>
                                <fieldset className="custom-fieldset">
                                    <legend className="text-sm mx-2">
                                        <label>
                                            Email
                                        </label>
                                    </legend>
                                    <input
                                        type="email"
                                        name="email"
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        value={data.email}
                                        className="custom-input"
                                        placeholder="Enter customer email"
                                    />
                                </fieldset>
                                <small className="text-destructive">
                                    {errors.email}
                                </small>
                            </div>

                            {/* Address */}
                            <div>
                                <fieldset className="custom-fieldset lg:col-span-3">
                                    <legend className="text-sm mx-2">
                                        <label>Address</label>
                                    </legend>
                                    <textarea
                                        name="address"
                                        onChange={(e) =>
                                            setData("address", e.target.value)
                                        }
                                        value={data.address}
                                        className="custom-input resize-none"
                                        placeholder="Enter customer address"
                                        rows={3}
                                    ></textarea>
                                    <small className="text-destructive">
                                        {errors.address}
                                    </small>
                                </fieldset>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="w-full flex justify-end">
                            <button type="submit" className="create-button" disabled={processing}>
                                {
                                    processing ? "Saving..." : "Save"
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Create;
