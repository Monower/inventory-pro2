import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage, Head } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import BackButton from "@/Components/BackButton/BackButton";

const Edit = ({ user, roles }) => {
    const { company_name } = usePage().props;
    const initialRole = user.roles[0] ? user.roles[0].name : "";

    const { data, setData, put, errors, post } = useForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        phone: user.phone || "",
        image: null,
        role: initialRole,
        remove_image: false,
        _method: 'PUT' //add this line
    });

    const [preview, setPreview] = useState(
        user.avatar ? "/storage/" + user.avatar : null
    );
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (data.image) {
            const objectUrl = URL.createObjectURL(data.image);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (!data.image && !data.remove_image && user.avatar) {
            setPreview("/storage/" + user.avatar);
        } else {
            setPreview(null);
        }
    }, [data.image, data.remove_image, user.avatar]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("user.update", user.id), {
            forceFormData: true,
        });
    };

    const removeImage = () => {
        setData("image", null);
        setData("remove_image", true);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = null;
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Edit user - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url={"users.index"} />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Edit user
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Update account details, change the assigned role,
                                and manage the user's profile image.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
                        {/* Name */}
                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">Name</legend>
                            <input
                                type="text"
                                name="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                className="custom-input"
                            />
                            {errors.name && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.name}
                                </p>
                            )}
                        </fieldset>

                        {/* Email */}
                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">Email</legend>
                            <input
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                className="custom-input"
                            />
                            {errors.email && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.email}
                                </p>
                            )}
                        </fieldset>

                        {/* Password */}
                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">Password</legend>
                            <input
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                placeholder="Leave empty to keep current password"
                                className="custom-input"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.password}
                                </p>
                            )}
                        </fieldset>

                        {/* Phone */}
                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">Phone</legend>
                            <input
                                type="number"
                                name="phone"
                                value={data.phone}
                                onChange={(e) =>
                                    setData("phone", e.target.value)
                                }
                                className="custom-input"
                            />
                            {errors.phone && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.phone}
                                </p>
                            )}
                        </fieldset>

                        {/* Role */}
                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">Role</legend>
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
                            <legend className="text-sm mx-2">Image</legend>
                            <input
                                ref={fileInputRef}
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={(e) => {
                                    setData("image", e.target.files[0]);
                                    setData("remove_image", false);
                                }}
                                className="custom-input ml-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border file:border-input file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:opacity-90"
                            />
                            {errors.image && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.image}
                                </p>
                            )}
                        </fieldset>
                    </div>

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
                            className="edit-button"
                        >
                            Update
                        </button>
                    </div>
                </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
