import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Link, useForm, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { sanitizePhoneInput } from "@/lib/phone";

const Edit = ({ staff, roles = [], branches = [] }) => {
    const { settings } = usePage().props;
    const phoneDigits = Number(settings?.phone_digits || 11);
    const initialRole = staff.roles?.[0]?.name || "";

    const { data, setData, post, processing, errors } = useForm({
        name: staff.name || "",
        email: staff.email || "",
        password: "",
        phone: staff.phone || "",
        salary: staff.salary || "",
        address: staff.address || "",
        branch_id: staff.branch_id || "",
        role: initialRole,
        image: null,
        remove_image: false,
        _method: "PUT",
    });

    const [preview, setPreview] = useState(
        staff.avatar ? `/storage/${staff.avatar}` : null
    );
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (data.image) {
            const objectUrl = URL.createObjectURL(data.image);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        }

        if (!data.remove_image && staff.avatar) {
            setPreview(`/storage/${staff.avatar}`);
            return;
        }

        setPreview(null);
    }, [data.image, data.remove_image, staff.avatar]);

    const handleSubmit = (event) => {
        event.preventDefault();
        post(route("employee.update", staff.id), {
            forceFormData: true,
        });
    };

    const removeImage = () => {
        setData("image", null);
        setData("remove_image", true);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    return (
        <AuthenticatedLayout title="Edit Employee">
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"employees.index"} />
                    <h3 className="heading">Edit Employee</h3>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">
                                <label className="required-label">Name</label>
                            </legend>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className="custom-input"
                            />
                            <small className="text-destructive">{errors.name}</small>
                        </fieldset>

                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">
                                <label className="required-label">Phone</label>
                            </legend>
                            <input
                                type="text"
                                value={data.phone}
                                onChange={(e) =>
                                    setData(
                                        "phone",
                                        sanitizePhoneInput(e.target.value, phoneDigits)
                                    )
                                }
                                className="custom-input"
                                inputMode="numeric"
                                maxLength={phoneDigits}
                            />
                            <div className="mt-1 text-right text-xs text-muted-foreground">
                                {data.phone.length}/{phoneDigits}
                            </div>
                            <small className="text-destructive">{errors.phone}</small>
                        </fieldset>

                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">
                                <label>Email</label>
                            </legend>
                            <input
                                type="email"
                                value={data.email}
                                onChange={(e) => setData("email", e.target.value)}
                                className="custom-input"
                            />
                            <small className="text-destructive">{errors.email}</small>
                        </fieldset>

                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">
                                <label>Password</label>
                            </legend>
                            <input
                                type="password"
                                value={data.password}
                                onChange={(e) => setData("password", e.target.value)}
                                className="custom-input"
                                placeholder="Leave blank to keep current password"
                            />
                            <small className="text-destructive">{errors.password}</small>
                        </fieldset>

                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">
                                <label className="required-label">Role</label>
                            </legend>
                            <select
                                value={data.role}
                                onChange={(e) => setData("role", e.target.value)}
                                className="custom-input"
                            >
                                <option value="">Select role</option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.name}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                            <small className="text-destructive">{errors.role}</small>
                        </fieldset>

                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">
                                <label>Branch</label>
                            </legend>
                            <select
                                value={data.branch_id}
                                onChange={(e) => setData("branch_id", e.target.value)}
                                className="custom-input"
                            >
                                <option value="">All branches / Head office</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.id}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                            <small className="text-destructive">{errors.branch_id}</small>
                        </fieldset>

                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">
                                <label>Salary</label>
                            </legend>
                            <input
                                type="number"
                                value={data.salary}
                                onChange={(e) => setData("salary", e.target.value)}
                                className="custom-input"
                            />
                            <small className="text-destructive">{errors.salary}</small>
                        </fieldset>

                        <fieldset className="custom-fieldset p-2 sm:col-span-2">
                            <legend className="text-sm mx-2">
                                <label>Address</label>
                            </legend>
                            <textarea
                                value={data.address}
                                onChange={(e) => setData("address", e.target.value)}
                                className="custom-input"
                                rows="1"
                            />
                            <small className="text-destructive">{errors.address}</small>
                        </fieldset>

                        <fieldset className="custom-fieldset p-2">
                            <legend className="text-sm mx-2">
                                <label>Image</label>
                            </legend>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setData("image", e.target.files[0]);
                                    setData("remove_image", false);
                                }}
                                className="custom-input ml-2 file:mr-4 file:rounded-full file:border file:border-input file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-secondary-foreground hover:file:opacity-90"
                            />
                            <small className="text-destructive">{errors.image}</small>
                        </fieldset>
                    </div>

                    {preview && (
                        <div className="mb-4 flex justify-end">
                            <div className="relative inline-block">
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="h-24 w-24 rounded border object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                                >
                                    x
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end">
                        <Link href={route("employees.index")} className="delete-button mr-2 text-center">
                            Cancel
                        </Link>
                        <button className="create-button" type="submit" disabled={processing}>
                            {processing ? "Updating..." : "Update"}
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
