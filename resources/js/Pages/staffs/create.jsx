import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import { sanitizePhoneInput } from "@/lib/phone";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

const Create = ({ roles = [], branches = [] }) => {
    const { settings } = usePage().props;
    const phoneDigits = Number(settings?.phone_digits || 11);
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        email: "",
        password: "",
        phone: "",
        salary: "",
        address: "",
        branch_id: "",
        role: "",
        image: null,
    });

    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (!data.image) {
            setPreview(null);
            return;
        }

        const objectUrl = URL.createObjectURL(data.image);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [data.image]);

    const handleSubmit = (event) => {
        event.preventDefault();
        post(route("employee.store"), {
            forceFormData: true,
        });
    };

    const removeImage = () => {
        setData("image", null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = null;
        }
    };

    return (
        <AuthenticatedLayout title="Create Employee">
            <CreatePageLayout
                title="Create Employee"
                description="Add a team member with the right identity, role, branch scope, and payroll details so operations and permissions stay clean from the start."
                backRoute="employees.index"
                meta={[
                    { label: "Module", value: "Staff management" },
                    { label: "Includes", value: "Role and branch assignment" },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Staff Setup Guidance"
                        items={[
                            {
                                title: "Assign role carefully",
                                description:
                                    "Permissions come from the chosen role, so pick the closest operational match.",
                            },
                            {
                                title: "Use branch scope intentionally",
                                description:
                                    "Leave branch empty for cross-branch or head-office access when appropriate.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <CreateSectionCard
                        title="Employee Details"
                        description="Capture the core profile information used across authentication, payroll, and branch operations."
                    >
                        <div className="form-grid">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Name
                                    </legend>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        className="custom-input"
                                        placeholder="Enter employee name"
                                    />
                                </fieldset>
                                {errors.name ? <p className="field-error">{errors.name}</p> : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Phone
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
                                        placeholder="Enter employee phone"
                                        inputMode="numeric"
                                        maxLength={phoneDigits}
                                    />
                                </fieldset>
                                <div className="text-right text-xs text-muted-foreground">
                                    {data.phone.length}/{phoneDigits}
                                </div>
                                {errors.phone ? (
                                    <p className="field-error">{errors.phone}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Email
                                    </legend>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        className="custom-input"
                                        placeholder="Enter employee email"
                                    />
                                </fieldset>
                                {errors.email ? <p className="field-error">{errors.email}</p> : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Password
                                    </legend>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData("password", e.target.value)}
                                        className="custom-input"
                                        placeholder="Enter employee password"
                                    />
                                </fieldset>
                                {errors.password ? (
                                    <p className="field-error">{errors.password}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Role
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
                                </fieldset>
                                {errors.role ? <p className="field-error">{errors.role}</p> : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Branch
                                    </legend>
                                    <select
                                        value={data.branch_id}
                                        onChange={(e) => setData("branch_id", e.target.value)}
                                        className="custom-input"
                                    >
                                        <option value="">
                                            All branches / Head office
                                        </option>
                                        {branches.map((branch) => (
                                            <option key={branch.id} value={branch.id}>
                                                {branch.name}
                                            </option>
                                        ))}
                                    </select>
                                </fieldset>
                                {errors.branch_id ? (
                                    <p className="field-error">{errors.branch_id}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Salary
                                    </legend>
                                    <input
                                        type="number"
                                        value={data.salary}
                                        onChange={(e) => setData("salary", e.target.value)}
                                        className="custom-input"
                                        placeholder="Enter employee salary"
                                    />
                                </fieldset>
                                {errors.salary ? (
                                    <p className="field-error">{errors.salary}</p>
                                ) : null}
                            </div>

                            <div className="field-stack md:col-span-2 xl:col-span-2">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Address
                                    </legend>
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData("address", e.target.value)}
                                        className="custom-input resize-none"
                                        placeholder="Enter employee address"
                                        rows={4}
                                    />
                                </fieldset>
                                {errors.address ? (
                                    <p className="field-error">{errors.address}</p>
                                ) : null}
                            </div>
                        </div>
                    </CreateSectionCard>

                    <CreateSectionCard
                        title="Profile Image"
                        description="Optional, but useful for larger teams where staff recognition matters during operations."
                        footer={
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="create-button"
                                    disabled={processing}
                                >
                                    {processing ? "Saving..." : "Create employee"}
                                </button>
                            </div>
                        }
                    >
                        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-start">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Image
                                    </legend>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setData("image", e.target.files[0])}
                                        className="custom-input file:mr-4 file:rounded-full file:border file:border-input file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-secondary-foreground hover:file:opacity-90"
                                    />
                                </fieldset>
                                {errors.image ? <p className="field-error">{errors.image}</p> : null}
                            </div>

                            {preview ? (
                                <div className="flex justify-start lg:justify-end">
                                    <div className="relative inline-block rounded-[20px] border border-border bg-background p-3 shadow-sm">
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="h-28 w-28 rounded-2xl object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white hover:bg-red-600"
                                        >
                                            x
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
};

export default Create;
