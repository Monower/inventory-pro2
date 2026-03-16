import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import BackButton from "@/Components/BackButton/BackButton";

const Edit = ({ user, roles, branches = [] }) => {
    const initialRole = user.roles[0] ? user.roles[0].name : "";

    const { data, setData, put, errors, post } = useForm({
        name: user.name || "",
        email: user.email || "",
        password: "",
        phone: user.phone || "",
        branch_id: user.branch_id || "",
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
        <AuthenticatedLayout title="Edit User">
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"users.index"} />
                    <h3 className="heading">Edit User</h3>
                </div>

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
                            <legend className="text-sm mx-2">Branch</legend>
                            <select
                                value={data.branch_id}
                                onChange={(e) =>
                                    setData("branch_id", e.target.value)
                                }
                                className="custom-input"
                            >
                                <option value="">All branches / Head office</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                            {errors.branch_id && (
                                <p className="text-red-500 text-xs mt-1">
                                    {errors.branch_id}
                                </p>
                            )}
                        </fieldset>

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

                    <div>
                        <button
                            type="submit"
                            className="edit-button"
                        >
                            Update
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
