import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, Link } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";

const Edit = ({ customer }) => {
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
