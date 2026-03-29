import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, Head, Link } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";
import { usePage } from "@inertiajs/react";

const Edit = ({ customer }) => {
    const { company_name } = usePage().props;
    const {
        data,
        setData,
        put: update,
        processing,
        errors,
    } = useForm({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        update(route("customer.update", customer.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Update customer - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"customers.index"} />
                        <div>
                            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Update Customer</h1>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Edit the customer record while keeping all contact details organized.</p>
                        </div>
                    </div>
                </div>

                {/* Form */}
                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">
                            {/* Phone */}
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
                                        placeholder="Enter customer phone"
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
                                        value={data.email}
                                        type="email"
                                        name="email"
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
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
                                        value={data.address}
                                        name="address"
                                        onChange={(e) =>
                                            setData("address", e.target.value)
                                        }
                                        className="custom-input resize-none"
                                        placeholder="Enter customer address"
                                        rows={3}
                                    ></textarea>
                                </fieldset>
                                <small className="text-destructive">
                                    {errors.address}
                                </small>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="w-full flex justify-end">
                            <Link
                                href={route("customers.index")}
                                className="delete-button mr-2 text-center"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className="create-button"
                            >
                                {
                                    processing ? "Updating..." : "Update"
                                }
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
