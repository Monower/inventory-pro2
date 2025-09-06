import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";

const Create = ({ roles }) => {
    const { data, setData, post, errors } = useForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        image: "",
        role: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("user.store"));
    };

    console.log("data: ", data);
    console.log("errors: ", errors);

    return (
        <AuthenticatedLayout>
            <section>
                <div className="mb-4">
                    <h3 className="text-xl font-semibold">Add new user</h3>
                </div>

                <div>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-3 gap-2 mb-4">
                            {/* Name */}
                            <fieldset className="border border-gray-300 bg-white p-2">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Name
                                    </label>
                                </legend>
                                <input
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) =>
                                        setData("name", e.target.value)
                                    }
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter user name"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </fieldset>

                            {/* Email */}
                            <fieldset className="border border-gray-300 bg-white p-2">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Email
                                    </label>
                                </legend>
                                <input
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter user email"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </fieldset>

                            {/* Password */}
                            <fieldset className="border border-gray-300 bg-white p-2">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Password
                                    </label>
                                </legend>
                                <input
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    onChange={(e) =>
                                        setData("password", e.target.value)
                                    }
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter user password"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </fieldset>

                            {/* Phone */}
                            <fieldset className="border border-gray-300 bg-white p-2">
                                <legend className="text-sm mx-2">
                                    <label>Phone</label>
                                </legend>
                                <input
                                    type="number"
                                    name="phone"
                                    value={data.phone}
                                    onChange={(e) =>
                                        setData("phone", e.target.value)
                                    }
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                    placeholder="Enter user phone"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.phone}
                                    </p>
                                )}
                            </fieldset>

                            {/* Image */}
                            <fieldset className="border border-gray-300 bg-white p-2">
                                <legend className="text-sm mx-2">
                                    <label>Image</label>
                                </legend>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*" // ✅ only allow images in file picker
                                    onChange={(e) =>
                                        setData("image", e.target.files[0])
                                    }
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm ml-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
                                />

                                {errors.image && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.image}
                                    </p>
                                )}
                            </fieldset>

                            {/* Role */}
                            <fieldset className="border border-gray-300 bg-white p-2">
                                <legend className="text-sm mx-2">
                                    <label className="after:content-['*'] after:ml-0.5 after:text-red-500">
                                        Role
                                    </label>
                                </legend>
                                <select
                                    value={data.role}
                                    onChange={(e) =>
                                        setData("role", e.target.value)
                                    }
                                    className="border-none w-full focus:outline-none focus:ring-0 placeholder:text-gray-400 placeholder:text-sm"
                                >
                                    <option value="">Select role</option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>

                                {errors.role && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.role}
                                    </p>
                                )}
                            </fieldset>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="bg-blue-500 text-white p-1 px-2 rounded"
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
