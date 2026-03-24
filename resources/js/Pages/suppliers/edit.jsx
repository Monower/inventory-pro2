import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

const Edit = ({ supplier }) => {
    const { data, setData, put, processing, errors } = useForm({
        name: supplier.name || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        contact_person: supplier.contact_person || "",
        address: supplier.address || "",
        notes: supplier.notes || "",
        is_active: Boolean(supplier.is_active),
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("suppliers.update", supplier.id));
    };

    return (
        <AuthenticatedLayout title="Edit Supplier">
            <CreatePageLayout
                title="Edit Supplier"
                description="Refine supplier contact and status details so purchasing, payments, and vendor communication stay dependable."
                backRoute="suppliers.index"
                badge="Edit"
                meta={[
                    { label: "Supplier ID", value: `${supplier.id}` },
                    { label: "Status", value: data.is_active ? "Active" : "Inactive" },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Supplier Maintenance"
                        items={[
                            {
                                title: "Keep contacts current",
                                description:
                                    "Updated phone and contact-person fields reduce delays in procurement follow-up.",
                            },
                            {
                                title: "Use notes meaningfully",
                                description:
                                    "Capture terms, lead times, or supplier-specific caveats rather than generic text.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={handleSubmit}>
                    <CreateSectionCard
                        title="Supplier Profile"
                        description="Update the vendor information this workspace depends on for procurement and due tracking."
                        footer={
                            <div className="flex justify-end gap-3">
                                <Link href={route("suppliers.index")} className="secondary-button">
                                    Cancel
                                </Link>
                                <button type="submit" disabled={processing} className="create-button">
                                    {processing ? "Updating..." : "Update supplier"}
                                </button>
                            </div>
                        }
                    >
                    <div className="form-grid">
                        <div className="field-stack">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">Name</legend>
                                <input className="custom-input" value={data.name} onChange={(e) => setData("name", e.target.value)} />
                            </fieldset>
                            <small className="text-destructive">{errors.name}</small>
                        </div>
                        <div className="field-stack">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">Phone</legend>
                                <input className="custom-input" value={data.phone} onChange={(e) => setData("phone", e.target.value)} />
                            </fieldset>
                            <small className="text-destructive">{errors.phone}</small>
                        </div>
                        <div className="field-stack">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">Email</legend>
                                <input type="email" className="custom-input" value={data.email} onChange={(e) => setData("email", e.target.value)} />
                            </fieldset>
                            <small className="text-destructive">{errors.email}</small>
                        </div>
                        <div className="field-stack">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">Contact Person</legend>
                                <input className="custom-input" value={data.contact_person} onChange={(e) => setData("contact_person", e.target.value)} />
                            </fieldset>
                        </div>
                        <div className="field-stack">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">Status</legend>
                                <select className="custom-input" value={data.is_active ? "1" : "0"} onChange={(e) => setData("is_active", e.target.value === "1")}>
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </fieldset>
                        </div>
                        <div className="field-stack md:col-span-2 xl:col-span-3">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">Address</legend>
                                <textarea className="custom-input resize-none" rows={3} value={data.address} onChange={(e) => setData("address", e.target.value)} />
                            </fieldset>
                        </div>
                        <div className="field-stack md:col-span-2 xl:col-span-3">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">Notes</legend>
                                <textarea className="custom-input resize-none" rows={3} value={data.notes} onChange={(e) => setData("notes", e.target.value)} />
                            </fieldset>
                        </div>
                    </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
};

export default Edit;
