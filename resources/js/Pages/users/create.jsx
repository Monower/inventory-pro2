import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, Head, usePage } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import BackButton from "@/Components/BackButton/BackButton";

const Create = ({ roles }) => {
    const { company_name } = usePage().props;
    const { data, setData, post, errors } = useForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        image: "",
        role: "",
    });

    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null); // ref to reset file input

    // Update preview whenever image changes
    useEffect(() => {
        if (data.image) {
            const objectUrl = URL.createObjectURL(data.image);
            setPreview(objectUrl);

            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setPreview(null);
        }
    }, [data.image]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("user.store"));
    };

    const removeImage = () => {
        setData("image", null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = null; // reset file input
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Create User - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"users.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Add new user
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Create a user account, assign a role, and upload
                                an optional profile image.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                            {/* Name */}
                            <fieldset className="custom-fieldset p-2">
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
                                    className="custom-input"
                                    placeholder="Enter user name"
                                />
                                {errors.name && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.name}
                                    </p>
                                )}
                            </fieldset>

                            {/* Email */}
                            <fieldset className="custom-fieldset p-2">
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
                                    className="custom-input"
                                    placeholder="Enter user email"
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.email}
                                    </p>
                                )}
                            </fieldset>

                            {/* Password */}
                            <fieldset className="custom-fieldset p-2">
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
                                    className="custom-input"
                                    placeholder="Enter user password"
                                />
                                {errors.password && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.password}
                                    </p>
                                )}
                            </fieldset>

                            {/* Phone */}
                            <fieldset className="custom-fieldset p-2">
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
                                    className="custom-input"
                                    placeholder="Enter user phone"
                                />
                                {errors.phone && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.phone}
                                    </p>
                                )}
                            </fieldset>

                            {/* Role */}
                            <fieldset className="custom-fieldset p-2">
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
                                    className="custom-input"
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

                            {/* Image */}
                            <fieldset className="custom-fieldset p-2">
                                <legend className="text-sm mx-2">
                                    <label>Image</label>
                                </legend>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setData("image", e.target.files[0])
                                    }
                                    className="custom-input ml-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border file:border-input file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:opacity-90"
                                />
                                {errors.image && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.image}
                                    </p>
                                )}
                            </fieldset>
                        </div>

                        {/* Image Preview Section */}

                        {preview && (
                            <div className="w-full flex justify-end">
                                <div className="relative inline-block mb-4">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-24 h-24 object-cover rounded border"
                                    />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="create-button"
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
