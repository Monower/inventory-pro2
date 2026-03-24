import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

const Create = () => {
    const { data, setData, post, processing, errors, transform } = useForm({
        name: "",
        code: "",
        phone: "",
        email: "",
        address: "",
        is_active: true,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        transform((payload) => ({
            ...payload,
            is_active: Boolean(payload.is_active),
        }));
        post(route("branch.store"));
    };

    return (
        <AuthenticatedLayout title="Create Branch">
            <CreatePageLayout
                title="Create Branch"
                description="Add a new business location with a clean identity, contact profile, and status so branch operations remain organized from day one."
                backRoute="branches.index"
                meta={[
                    { label: "Module", value: "Multi-branch setup" },
                    { label: "Important", value: "Unique branch code" },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Branch Setup Notes"
                        items={[
                            {
                                title: "Use a memorable code",
                                description:
                                    "Short codes help with staff communication, stock transfers, and reporting filters.",
                            },
                            {
                                title: "Control activation",
                                description:
                                    "Inactive branches stay on record without being used in daily branch workflows.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={handleSubmit}>
                    <CreateSectionCard
                        title="Branch Identity"
                        description="Define how this branch will appear across the system, from operational screens to cross-branch reports."
                        footer={
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="create-button"
                                >
                                    {processing ? "Saving..." : "Create branch"}
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
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        className="custom-input"
                                        placeholder="Branch name"
                                    />
                                </fieldset>
                                {errors.name ? <p className="field-error">{errors.name}</p> : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Code
                                    </legend>
                                    <input
                                        type="text"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData("code", e.target.value.toUpperCase())
                                        }
                                        className="custom-input"
                                        placeholder="Example: DHAKA-1"
                                    />
                                </fieldset>
                                {errors.code ? <p className="field-error">{errors.code}</p> : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Phone
                                    </legend>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData("phone", e.target.value)}
                                        className="custom-input"
                                        placeholder="Branch phone"
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
                                        value={data.email}
                                        onChange={(e) => setData("email", e.target.value)}
                                        className="custom-input"
                                        placeholder="Branch email"
                                    />
                                </fieldset>
                                {errors.email ? <p className="field-error">{errors.email}</p> : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Status
                                    </legend>
                                    <select
                                        value={data.is_active ? "1" : "0"}
                                        onChange={(e) =>
                                            setData("is_active", e.target.value === "1")
                                        }
                                        className="custom-input"
                                    >
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </fieldset>
                                {errors.is_active ? (
                                    <p className="field-error">{errors.is_active}</p>
                                ) : null}
                            </div>

                            <div className="field-stack md:col-span-2 xl:col-span-3">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Address
                                    </legend>
                                    <textarea
                                        value={data.address}
                                        onChange={(e) => setData("address", e.target.value)}
                                        className="custom-input resize-none"
                                        rows={4}
                                        placeholder="Branch address"
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
