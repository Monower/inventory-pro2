import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

const Edit = ({ branch }) => {
    const { data, setData, put, processing, errors, transform } = useForm({
        name: branch.name,
        code: branch.code,
        phone: branch.phone || "",
        email: branch.email || "",
        address: branch.address || "",
        is_active: Boolean(branch.is_active),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        transform((payload) => ({
            ...payload,
            is_active: Boolean(payload.is_active),
        }));
        put(route("branch.update", branch.id));
    };

    return (
        <AuthenticatedLayout title="Edit Branch">
            <CreatePageLayout
                title="Edit Branch"
                description="Update branch identity, status, and contact details so multi-branch operations keep using accurate location data."
                backRoute="branches.index"
                badge="Edit"
                meta={[
                    { label: "Branch ID", value: `${branch.id}` },
                    { label: "Code", value: data.code || "Not set" },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Branch Maintenance"
                        items={[
                            {
                                title: "Protect the branch code",
                                description:
                                    "Consistent codes make branch switching, reporting, and stock transfer references easier to trust.",
                            },
                            {
                                title: "Use inactive instead of delete when possible",
                                description:
                                    "Preserving branch records helps avoid confusion in historical reports.",
                            },
                        ]}
                    />
                }
            >

                <form onSubmit={handleSubmit}>
                    <CreateSectionCard
                        title="Branch Profile"
                        description="Refine how this branch appears across operational workflows and reports."
                        footer={
                            <div className="flex justify-end gap-3">
                                <Link href={route("branches.index")} className="secondary-button">
                                    Cancel
                                </Link>
                                <button type="submit" disabled={processing} className="create-button">
                                    {processing ? "Updating..." : "Update branch"}
                                </button>
                            </div>
                        }
                    >
                    <div className="form-grid">
                        <div className="field-stack">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">Name</legend>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className="custom-input"
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.name}</small>
                        </div>
                        <div className="field-stack">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">Code</legend>
                                <input
                                    type="text"
                                    value={data.code}
                                    onChange={(e) => setData("code", e.target.value.toUpperCase())}
                                    className="custom-input"
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.code}</small>
                        </div>
                        <div className="field-stack">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">Phone</legend>
                                <input
                                    type="text"
                                    value={data.phone}
                                    onChange={(e) => setData("phone", e.target.value)}
                                    className="custom-input"
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.phone}</small>
                        </div>
                        <div className="field-stack">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">Email</legend>
                                <input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData("email", e.target.value)}
                                    className="custom-input"
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.email}</small>
                        </div>
                        <div className="field-stack">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">Status</legend>
                                <select
                                    value={data.is_active ? "1" : "0"}
                                    onChange={(e) => setData("is_active", e.target.value === "1")}
                                    className="custom-input"
                                >
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </fieldset>
                            <small className="text-destructive">{errors.is_active}</small>
                        </div>
                        <div className="field-stack md:col-span-2 xl:col-span-3">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">Address</legend>
                                <textarea
                                    value={data.address}
                                    onChange={(e) => setData("address", e.target.value)}
                                    className="custom-input resize-none"
                                    rows={3}
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.address}</small>
                        </div>
                    </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
};

export default Edit;
