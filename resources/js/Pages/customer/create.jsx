import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import BackButton from "@/Components/BackButton/BackButton";

const Create = () => {
    const { data, setData, post, errors } = useForm({
        name: "",
        email: "",
        phone: "",
        address: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("customer.store"));
    };

    return (
        <AuthenticatedLayout>
            <section className="px-4">
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
                            <fieldset className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-md">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Name
                                    </label>
                                </legend>
                                <input
                                    type="text"
                                    name="name"
                                    onChange={(e) => setData("name", e.target.value)}
                                    value={data.name}
                                    className="w-full border-none bg-transparent text-[hsl(var(--foreground))] focus:outline-none focus:ring-0 placeholder:text-[hsl(var(--muted-foreground))] placeholder:text-sm p-2"
                                    placeholder="Enter customer name"
                                />
                            </fieldset>

                            {/* Email */}
                            <fieldset className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-md">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Email
                                    </label>
                                </legend>
                                <input
                                    type="email"
                                    name="email"
                                    onChange={(e) => setData("email", e.target.value)}
                                    value={data.email}
                                    className="w-full border-none bg-transparent text-[hsl(var(--foreground))] focus:outline-none focus:ring-0 placeholder:text-[hsl(var(--muted-foreground))] placeholder:text-sm p-2"
                                    placeholder="Enter customer email"
                                />
                            </fieldset>

                            {/* Phone */}
                            <fieldset className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-md">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Phone
                                    </label>
                                </legend>
                                <input
                                    type="number"
                                    name="phone"
                                    onChange={(e) => setData("phone", e.target.value)}
                                    value={data.phone}
                                    className="w-full border-none bg-transparent text-[hsl(var(--foreground))] focus:outline-none focus:ring-0 placeholder:text-[hsl(var(--muted-foreground))] placeholder:text-sm p-2"
                                    placeholder="Enter customer phone"
                                />
                            </fieldset>

                            {/* Address */}
                            <fieldset className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] rounded-md lg:col-span-3">
                                <legend className="text-sm mx-2">
                                    <label>Address</label>
                                </legend>
                                <textarea
                                    name="address"
                                    onChange={(e) => setData("address", e.target.value)}
                                    value={data.address}
                                    className="w-full border-none bg-transparent text-[hsl(var(--foreground))] focus:outline-none focus:ring-0 placeholder:text-[hsl(var(--muted-foreground))] placeholder:text-sm p-2 resize-none"
                                    placeholder="Enter customer address"
                                    rows={3}
                                ></textarea>
                            </fieldset>
                        </div>

                        {/* Submit Button */}
                        <div className="w-full flex justify-end">
                            <button
                                type="submit"
                                className="bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-2 rounded-md hover:opacity-90 transition"
                            >
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
