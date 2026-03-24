import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, Link, usePage } from "@inertiajs/react";
import { sanitizePhoneInput } from "@/lib/phone";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

const Edit = ({ customer }) => {
    const { settings } = usePage().props;
    const phoneDigits = Number(settings?.phone_digits || 11);
    const {
        data,
        setData,
        put: update,
        processing,
        errors,
    } = useForm({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        update(route("customer.update", customer.id));
    };

    return (
        <AuthenticatedLayout title="Edit Customer">
            <CreatePageLayout
                title="Edit Customer"
                description="Update customer information so sales, follow-up, and due collection continue to use accurate contact details."
                backRoute="customers.index"
                badge="Edit"
                meta={[
                    { label: "Customer ID", value: `${customer.id}` },
                    { label: "Phone digits", value: `${phoneDigits}` },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Editing Guidance"
                        items={[
                            {
                                title: "Keep the primary phone current",
                                description:
                                    "This record is often used during repeat checkout and collection follow-up.",
                            },
                            {
                                title: "Use address only when useful",
                                description:
                                    "A clean profile is easier to search and maintain than one filled with outdated details.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={handleSubmit}>
                    <CreateSectionCard
                        title="Customer Profile"
                        description="Refine the customer record without changing the overall relationship history attached to it."
                        footer={
                            <div className="flex justify-end gap-3">
                                <Link
                                    href={route("customers.index")}
                                    className="secondary-button"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="create-button"
                                >
                                    {processing ? "Updating..." : "Update customer"}
                                </button>
                            </div>
                        }
                    >
                        <div className="form-grid">
                            {/* Phone */}
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Phone
                                    </legend>
                                    <input
                                        value={data.phone}
                                        type="text"
                                        name="phone"
                                        onChange={(e) =>
                                            setData(
                                                "phone",
                                                sanitizePhoneInput(e.target.value, phoneDigits)
                                            )
                                        }
                                        className="custom-input"
                                        placeholder="Enter customer phone"
                                        inputMode="numeric"
                                        maxLength={phoneDigits}
                                    />
                                </fieldset>
                                <div className="mt-1 text-right text-xs text-muted-foreground">
                                    {data.phone.length}/{phoneDigits}
                                </div>
                                <small className="text-destructive">{errors.phone}</small>
                            </div>


                            {/* Name */}
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Name
                                    </legend>
                                    <input
                                        value={data.name}
                                        type="text"
                                        name="name"
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder="Enter customer name"
                                    />
                                </fieldset>
                                <small className="text-destructive">{errors.name}</small>
                            </div>

                            

                            {/* Email */}
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Email
                                    </legend>
                                    <input
                                        value={data.email}
                                        type="email"
                                        name="email"
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        className="custom-input"
                                        placeholder="Enter customer email"
                                    />
                                </fieldset>
                                <small className="text-destructive">{errors.email}</small>
                            </div>

                            {/* Address */}
                            <div className="field-stack md:col-span-2 xl:col-span-3">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Address
                                    </legend>
                                    <textarea
                                        value={data.address}
                                        name="address"
                                        onChange={(e) =>
                                            setData("address", e.target.value)
                                        }
                                        className="custom-input resize-none"
                                        placeholder="Enter customer address"
                                        rows={3}
                                    ></textarea>
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
