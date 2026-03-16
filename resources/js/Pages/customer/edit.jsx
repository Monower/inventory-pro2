import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, Link, usePage } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";
import { sanitizePhoneInput } from "@/lib/phone";

const Edit = ({ customer }) => {
    const { settings } = usePage().props;
    const phoneDigits = Number(settings?.phone_digits || 11);
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
        <AuthenticatedLayout title="Edit Customer">
            <section>
                {/* Header */}
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"customers.index"} />
                    <h1 className="heading">Edit Customer</h1>
                </div>

                {/* Form */}
                <div>
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
                                        type="text"
                                        name="phone"
                                        onChange={(e) =>
                                            setData(
                                                "phone",
                                                sanitizePhoneInput(e.target.value, phoneDigits)
                                            )
                                        }
                                        className="custom-input"
                                        placeholder="Enter customer phone"
                                        inputMode="numeric"
                                        maxLength={phoneDigits}
                                    />
                                </fieldset>
                                <div className="mt-1 text-right text-xs text-muted-foreground">
                                    {data.phone.length}/{phoneDigits}
                                </div>
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
