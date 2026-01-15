import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, Head } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";
import { usePage } from "@inertiajs/react";

const Create = () => {
    const { company_name } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        phone: "",
        email: "",
        address: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if(data?.name?.trim() === "") {
            alert("Customer name is required.");
            return;
        } else if(data?.phone?.trim() === "") {
            alert("Customer phone is required.");
            return;
        }
        post(route("customer.store"));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Add customer - ${company_name}`} />
            <section>
                {/* Header */}
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"customers.index"} />
                    <h3 className="heading">Add new customer</h3>
                </div>

                {/* Form */}
                <div>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mb-4">
                            {/* Name */}
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
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        value={data.name}
                                        className="custom-input"
                                        placeholder="Enter customer name"
                                        required
                                    />
                                </fieldset>
                                <small className="text-destructive">
                                    {errors.name}
                                </small>
                            </div>

                            {/* Phone */}
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