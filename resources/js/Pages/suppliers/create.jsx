import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

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
            <CreatePageLayout
                title="Create Supplier"
                description="Create a supplier profile with reliable contact details so purchasing, due tracking, and procurement history remain easy to manage."
                backRoute="suppliers.index"
                meta={[
                    { label: "Module", value: "Procurement" },
                    { label: "Best for", value: "Purchases and due tracking" },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Supplier Quality"
                        items={[
                            {
                                title: "Keep contact names current",
                                description:
                                    "A direct contact person reduces delays during purchasing or payment follow-up.",
                            },
                            {
                                title: "Capture notes with context",
                                description:
                                    "Use notes for payment terms, lead times, or special handling preferences.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={handleSubmit}>
                    <CreateSectionCard
                        title="Supplier Profile"
                        description="Build a complete supplier profile that supports both day-to-day purchasing and longer-term vendor management."
                        footer={
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="create-button"
                                >
                                    {processing ? "Saving..." : "Create supplier"}
                                </button>
                            </div>
                        }
                    >
                        <div className="form-grid">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Name
                                    </legend>
                                    <input
                                        className="custom-input"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        placeholder="Supplier name"
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
                                        className="custom-input"
                                        value={data.phone}
                                        onChange={(e) => setData("phone", e.target.value)}
                                        placeholder="Supplier phone"
                                    />
                                </fieldset>
                                {errors.phone ? <p className="field-error">{errors.phone}</p> : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Email
                                    </legend>
                                    <input
                                        type="email"
                                        className="custom-input"
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        placeholder="Supplier email"
                                    />
                                </fieldset>
                                {errors.email ? <p className="field-error">{errors.email}</p> : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Contact person
                                    </legend>
                                    <input
                                        className="custom-input"
                                        value={data.contact_person}
                                        onChange={(e) =>
                                            setData("contact_person", e.target.value)
                                        }
                                        placeholder="Primary supplier contact"
                                    />
                                </fieldset>
                                {errors.contact_person ? (
                                    <p className="field-error">{errors.contact_person}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Status
                                    </legend>
                                    <select
                                        className="custom-input"
                                        value={data.is_active ? "1" : "0"}
                                        onChange={(e) =>
                                            setData("is_active", e.target.value === "1")
                                        }
                                    >
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </fieldset>
                            </div>

                            <div className="field-stack md:col-span-2 xl:col-span-3">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Address
                                    </legend>
                                    <textarea
                                        className="custom-input resize-none"
                                        rows={4}
                                        value={data.address}
                                        onChange={(e) => setData("address", e.target.value)}
                                        placeholder="Supplier address"
                                    />
                                </fieldset>
                            </div>

                            <div className="field-stack md:col-span-2 xl:col-span-3">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Notes
                                    </legend>
                                    <textarea
                                        className="custom-input resize-none"
                                        rows={4}
                                        value={data.notes}
                                        onChange={(e) => setData("notes", e.target.value)}
                                        placeholder="Payment terms, lead times, or other remarks"
                                    />
                                </fieldset>
                            </div>
                        </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
};

export default Create;
