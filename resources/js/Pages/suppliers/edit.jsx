import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Link, useForm } from "@inertiajs/react";

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
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"suppliers.index"} />
                    <h3 className="heading">Edit Supplier</h3>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4 grid grid-cols-1 gap-2 lg:grid-cols-3">
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm"><label className="required-label">Name</label></legend>
                                <input className="custom-input" value={data.name} onChange={(e) => setData("name", e.target.value)} />
                            </fieldset>
                            <small className="text-destructive">{errors.name}</small>
                        </div>
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm"><label>Phone</label></legend>
                                <input className="custom-input" value={data.phone} onChange={(e) => setData("phone", e.target.value)} />
                            </fieldset>
                            <small className="text-destructive">{errors.phone}</small>
                        </div>
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm"><label>Email</label></legend>
                                <input type="email" className="custom-input" value={data.email} onChange={(e) => setData("email", e.target.value)} />
                            </fieldset>
                            <small className="text-destructive">{errors.email}</small>
                        </div>
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm"><label>Contact Person</label></legend>
                                <input className="custom-input" value={data.contact_person} onChange={(e) => setData("contact_person", e.target.value)} />
                            </fieldset>
                        </div>
                        <div>
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm"><label>Status</label></legend>
                                <select className="custom-input" value={data.is_active ? "1" : "0"} onChange={(e) => setData("is_active", e.target.value === "1")}>
                                    <option value="1">Active</option>
                                    <option value="0">Inactive</option>
                                </select>
                            </fieldset>
                        </div>
                        <div className="lg:col-span-3">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm"><label>Address</label></legend>
                                <textarea className="custom-input resize-none" rows={3} value={data.address} onChange={(e) => setData("address", e.target.value)} />
                            </fieldset>
                        </div>
                        <div className="lg:col-span-3">
                            <fieldset className="custom-fieldset">
                                <legend className="mx-2 text-sm"><label>Notes</label></legend>
                                <textarea className="custom-input resize-none" rows={3} value={data.notes} onChange={(e) => setData("notes", e.target.value)} />
                            </fieldset>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Link href={route("suppliers.index")} className="delete-button">Cancel</Link>
                        <button type="submit" disabled={processing} className="create-button">
                            {processing ? "Updating..." : "Update"}
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
