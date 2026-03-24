import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";
import CreateInfoPanel from "@/Components/Form/CreateInfoPanel";
import CreatePageLayout from "@/Components/Form/CreatePageLayout";
import CreateSectionCard from "@/Components/Form/CreateSectionCard";

const CouponCreate = () => {
    const { data, setData, post, processing, errors, transform } = useForm({
        code: "",
        name: "",
        discount_type: "fixed",
        discount_value: "",
        max_discount_amount: "",
        minimum_order_amount: "",
        usage_limit: "",
        is_active: "1",
        starts_at: "",
        expires_at: "",
    });

    const submit = (event) => {
        event.preventDefault();
        transform((formData) => ({
            ...formData,
            is_active: formData.is_active === "1",
            max_discount_amount: formData.max_discount_amount || null,
            minimum_order_amount: formData.minimum_order_amount || 0,
            usage_limit: formData.usage_limit || null,
            starts_at: formData.starts_at || null,
            expires_at: formData.expires_at || null,
        }));
        post(route("coupons.store"));
    };

    return (
        <AuthenticatedLayout title="Create Coupon">
            <CreatePageLayout
                title="Create Coupon"
                description="Configure a promotion with clear discount rules, minimum order logic, and validity windows so offers stay profitable and predictable."
                backRoute="coupons.index"
                meta={[
                    { label: "Module", value: "Promotions" },
                    { label: "Supports", value: "Fixed or percent discount" },
                ]}
                aside={
                    <CreateInfoPanel
                        title="Promotion Design"
                        items={[
                            {
                                title: "Protect your margins",
                                description:
                                    "Use minimum order thresholds and maximum discount amounts for stronger control.",
                            },
                            {
                                title: "Use clear expiry windows",
                                description:
                                    "Time-bound campaigns are easier to promote and review than open-ended offers.",
                            },
                        ]}
                    />
                }
            >
                <form onSubmit={submit} className="space-y-6">
                    <CreateSectionCard
                        title="Coupon Identity"
                        description="Start with the public-facing code and internal label that staff will recognize during sales and reporting."
                    >
                        <div className="form-grid">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Code
                                    </legend>
                                    <input
                                        className="custom-input"
                                        value={data.code}
                                        onChange={(e) =>
                                            setData("code", e.target.value.toUpperCase())
                                        }
                                        placeholder="EID20"
                                    />
                                </fieldset>
                                {errors.code ? <p className="field-error">{errors.code}</p> : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Name
                                    </legend>
                                    <input
                                        className="custom-input"
                                        value={data.name}
                                        onChange={(e) => setData("name", e.target.value)}
                                        placeholder="Campaign name"
                                    />
                                </fieldset>
                                {errors.name ? <p className="field-error">{errors.name}</p> : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Status
                                    </legend>
                                    <select
                                        className="custom-input"
                                        value={data.is_active}
                                        onChange={(e) => setData("is_active", e.target.value)}
                                    >
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </fieldset>
                                {errors.is_active ? (
                                    <p className="field-error">{errors.is_active}</p>
                                ) : null}
                            </div>
                        </div>
                    </CreateSectionCard>

                    <CreateSectionCard
                        title="Discount Rules"
                        description="Define how the coupon behaves during checkout and what guardrails should apply."
                    >
                        <div className="form-grid">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Discount type
                                    </legend>
                                    <select
                                        className="custom-input"
                                        value={data.discount_type}
                                        onChange={(e) =>
                                            setData("discount_type", e.target.value)
                                        }
                                    >
                                        <option value="fixed">Fixed</option>
                                        <option value="percent">Percent</option>
                                    </select>
                                </fieldset>
                                {errors.discount_type ? (
                                    <p className="field-error">{errors.discount_type}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Discount value
                                    </legend>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        className="custom-input"
                                        value={data.discount_value}
                                        onChange={(e) =>
                                            setData("discount_value", e.target.value)
                                        }
                                    />
                                </fieldset>
                                {errors.discount_value ? (
                                    <p className="field-error">{errors.discount_value}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Max discount amount
                                    </legend>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="custom-input"
                                        value={data.max_discount_amount}
                                        onChange={(e) =>
                                            setData("max_discount_amount", e.target.value)
                                        }
                                    />
                                </fieldset>
                                {errors.max_discount_amount ? (
                                    <p className="field-error">
                                        {errors.max_discount_amount}
                                    </p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Minimum order amount
                                    </legend>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="custom-input"
                                        value={data.minimum_order_amount}
                                        onChange={(e) =>
                                            setData("minimum_order_amount", e.target.value)
                                        }
                                    />
                                </fieldset>
                                {errors.minimum_order_amount ? (
                                    <p className="field-error">
                                        {errors.minimum_order_amount}
                                    </p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Usage limit
                                    </legend>
                                    <input
                                        type="number"
                                        min="1"
                                        className="custom-input"
                                        value={data.usage_limit}
                                        onChange={(e) =>
                                            setData("usage_limit", e.target.value)
                                        }
                                    />
                                </fieldset>
                                {errors.usage_limit ? (
                                    <p className="field-error">{errors.usage_limit}</p>
                                ) : null}
                            </div>
                        </div>
                    </CreateSectionCard>

                    <CreateSectionCard
                        title="Validity Window"
                        description="Use a clear availability period so campaigns can start and end automatically."
                        footer={
                            <div className="flex justify-end gap-3">
                                <Link
                                    href={route("coupons.index")}
                                    className="secondary-button"
                                >
                                    Cancel
                                </Link>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="create-button"
                                >
                                    {processing ? "Saving..." : "Create coupon"}
                                </button>
                            </div>
                        }
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Starts at
                                    </legend>
                                    <input
                                        type="datetime-local"
                                        className="custom-input"
                                        value={data.starts_at}
                                        onChange={(e) => setData("starts_at", e.target.value)}
                                    />
                                </fieldset>
                                {errors.starts_at ? (
                                    <p className="field-error">{errors.starts_at}</p>
                                ) : null}
                            </div>

                            <div className="field-stack">
                                <fieldset className="custom-fieldset">
                                    <legend className="mx-3 px-1 text-sm font-medium text-muted-foreground">
                                        Expires at
                                    </legend>
                                    <input
                                        type="datetime-local"
                                        className="custom-input"
                                        value={data.expires_at}
                                        onChange={(e) => setData("expires_at", e.target.value)}
                                    />
                                </fieldset>
                                {errors.expires_at ? (
                                    <p className="field-error">{errors.expires_at}</p>
                                ) : null}
                            </div>
                        </div>
                    </CreateSectionCard>
                </form>
            </CreatePageLayout>
        </AuthenticatedLayout>
    );
};

export default CouponCreate;
