import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { useForm } from "@inertiajs/react";

const Create = () => {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        phone: "",
        email: "",
        contact_person: "",
        address: "",
        notes: "",
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("suppliers.store"));
    };

    return (
        <AuthenticatedLayout title="Create Supplier">
            <section>
                <div className="mb-4 flex items-center gap-4">
                    <BackButton url={"suppliers.index"} />
                    <h3 className="heading">Create Supplier</h3>
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
                            <small className="text-destructive">{errors.contact_person}</small>
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
                    <div className="flex justify-end">
                        <button type="submit" disabled={processing} className="create-button">
                            {processing ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Create;
