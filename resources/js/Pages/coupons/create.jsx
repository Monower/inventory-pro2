import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, useForm } from "@inertiajs/react";

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
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="heading">Create Coupon</h3>
                        <p className="text-sm text-muted-foreground">
                            Define coupon rules with validity windows and usage limits.
                        </p>
                    </div>
                    <Link href={route("coupons.index")} className="edit-button">
                        Back to coupons
                    </Link>
                </div>

                <form onSubmit={submit} className="grid gap-4 rounded-lg border border-ring bg-background p-4 shadow-md md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium">Code</label>
                        <input className="custom-input" value={data.code} onChange={(e) => setData("code", e.target.value.toUpperCase())} />
                        <small className="text-destructive">{errors.code}</small>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Name</label>
                        <input className="custom-input" value={data.name} onChange={(e) => setData("name", e.target.value)} />
                        <small className="text-destructive">{errors.name}</small>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Discount type</label>
                        <select className="custom-input" value={data.discount_type} onChange={(e) => setData("discount_type", e.target.value)}>
                            <option value="fixed">Fixed</option>
                            <option value="percent">Percent</option>
                        </select>
                        <small className="text-destructive">{errors.discount_type}</small>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Discount value</label>
                        <input type="number" step="0.01" min="0.01" className="custom-input" value={data.discount_value} onChange={(e) => setData("discount_value", e.target.value)} />
                        <small className="text-destructive">{errors.discount_value}</small>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Max discount amount</label>
                        <input type="number" step="0.01" min="0" className="custom-input" value={data.max_discount_amount} onChange={(e) => setData("max_discount_amount", e.target.value)} />
                        <small className="text-destructive">{errors.max_discount_amount}</small>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Minimum order amount</label>
                        <input type="number" step="0.01" min="0" className="custom-input" value={data.minimum_order_amount} onChange={(e) => setData("minimum_order_amount", e.target.value)} />
                        <small className="text-destructive">{errors.minimum_order_amount}</small>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Usage limit</label>
                        <input type="number" min="1" className="custom-input" value={data.usage_limit} onChange={(e) => setData("usage_limit", e.target.value)} />
                        <small className="text-destructive">{errors.usage_limit}</small>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Status</label>
                        <select className="custom-input" value={data.is_active} onChange={(e) => setData("is_active", e.target.value)}>
                            <option value="1">Active</option>
                            <option value="0">Inactive</option>
                        </select>
                        <small className="text-destructive">{errors.is_active}</small>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Starts at</label>
                        <input type="datetime-local" className="custom-input" value={data.starts_at} onChange={(e) => setData("starts_at", e.target.value)} />
                        <small className="text-destructive">{errors.starts_at}</small>
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-medium">Expires at</label>
                        <input type="datetime-local" className="custom-input" value={data.expires_at} onChange={(e) => setData("expires_at", e.target.value)} />
                        <small className="text-destructive">{errors.expires_at}</small>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-3">
                        <Link href={route("coupons.index")} className="rounded-md border border-ring px-4 py-2 text-sm">
                            Cancel
                        </Link>
                        <button type="submit" disabled={processing} className="create-button">
                            {processing ? "Saving..." : "Create coupon"}
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default CouponCreate;
