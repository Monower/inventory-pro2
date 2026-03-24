import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage } from "@inertiajs/react";
import { useState } from "react";
import Alert from "@/Components/Alert/Alert";
import { sanitizePhoneInput } from "@/lib/phone";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

const Create = () => {
    const { settings } = usePage().props;
    const phoneDigits = Number(settings?.phone_digits || 11);
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        phone: "",
        email: "",
        address: "",
    });
    const [clientError, setClientError] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();

        if (data?.phone?.trim() === "") {
            setClientError("Customer phone is required.");
            return;
        }

        setClientError("");
        post(route("customer.store"));
    };

    return (
        <AuthenticatedLayout title="Create Customer">
            <CreatePageLayout
                title="Create Customer"
                description="Capture clean customer information so orders, due tracking, communication, and repeat sales stay reliable from the start."
                backRoute="customers.index"
                meta={[
                    { label: "Required", value: "Phone number" },
                    { label: "Outcome", value: "Reusable customer profile" },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Customer Data Tips"
                        items={[
                            {
                                title: "Phone first",
                                description:
                                    "A valid phone number makes repeat checkout and collections easier.",
                            },
                            {
                                title: "Use optional details wisely",
                                description:
                                    "Email and address are helpful for invoices, delivery, and customer support.",
                            },
                        ]}
                    />
                }
            >
                {clientError ? (
                    <Alert flash={{ error: clientError }} autoHideMs={3000} />
                ) : null}

                <form onSubmit={handleSubmit}>
                    <CreateSectionCard
                        title="Customer Profile"
                        description="Start with the contact details you need for daily operations. You can enrich the profile later as the relationship grows."
                        footer={
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="create-button"
                                    disabled={processing}
                                >
                                    {processing ? "Saving..." : "Create customer"}
                                </button>
                            </div>
                        }
                    >
                        <div className="form-grid">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Phone
                                    </legend>
                                    <input
                                        type="text"
                                        name="phone"
                                        onChange={(e) =>
                                            setData(
                                                "phone",
                                                sanitizePhoneInput(e.target.value, phoneDigits)
                                            )
                                        }
                                        value={data.phone}
                                        className="custom-input"
                                        placeholder="Enter customer phone"
                                        inputMode="numeric"
                                        maxLength={phoneDigits}
                                        required
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
                                        Name
                                    </legend>
                                    <input
                                        type="text"
                                        name="name"
                                        onChange={(e) => setData("name", e.target.value)}
                                        value={data.name}
                                        className="custom-input"
                                        placeholder="Enter customer name"
                                    />
                                </fieldset>
                                {errors.name ? (
                                    <p className="field-error">{errors.name}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Email
                                    </legend>
                                    <input
                                        type="email"
                                        name="email"
                                        onChange={(e) => setData("email", e.target.value)}
                                        value={data.email}
                                        className="custom-input"
                                        placeholder="Enter customer email"
                                    />
                                </fieldset>
                                {errors.email ? (
                                    <p className="field-error">{errors.email}</p>
                                ) : null}
                            </div>

                            <div className="field-stack md:col-span-2 xl:col-span-3">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Address
                                    </legend>
                                    <textarea
                                        name="address"
                                        onChange={(e) => setData("address", e.target.value)}
                                        value={data.address}
                                        className="custom-input resize-none"
                                        placeholder="Enter customer address"
                                        rows={4}
                                    />
                                </fieldset>
                                {errors.address ? (
                                    <p className="field-error">{errors.address}</p>
                                ) : null}
                            </div>
                        </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
};

export default Create;
