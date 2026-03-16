import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Link, router, usePage } from "@inertiajs/react";

const CouponsIndex = ({ coupons, filters }) => {
    const { auth } = usePage().props;
    const permissions = auth.user?.permissions || [];

    const updateSearch = (value) => {
        router.get(
            route("coupons.index"),
            { q: value },
            { preserveState: true, replace: true }
        );
    };

    return (
        <AuthenticatedLayout title="Coupons">
            <section className="space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h3 className="heading">Coupons</h3>
                        <p className="text-sm text-muted-foreground">
                            Manage reusable discount rules for POS and orders.
                        </p>
                    </div>
                    {permissions.includes("create coupon") && (
                        <Link href={route("coupons.create")} className="create-button">
                            Add coupon
                        </Link>
                    )}
                </div>

                <div className="rounded-lg border border-ring bg-background p-4 shadow-md">
                    <input
                        type="text"
                        value={filters.q || ""}
                        onChange={(event) => updateSearch(event.target.value)}
                        className="custom-input"
                        placeholder="Search by code, name, or type"
                    />
                </div>

                <div className="overflow-x-auto rounded-lg border border-ring bg-background shadow-md">
                    <table className="w-full min-w-[960px] text-sm">
                        <thead className="custom-thead">
                            <tr>
                                <th className="custom-th rounded-l-md">Code</th>
                                <th className="custom-th">Name</th>
                                <th className="custom-th">Type</th>
                                <th className="custom-th">Value</th>
                                <th className="custom-th">Minimum order</th>
                                <th className="custom-th">Usage</th>
                                <th className="custom-th">Status</th>
                                <th className="custom-th rounded-r-md">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coupons.data.length ? (
                                coupons.data.map((coupon) => (
                                    <tr key={coupon.id} className="custom-body-tr">
                                        <td className="custom-body-td font-medium">{coupon.code}</td>
                                        <td className="custom-body-td">{coupon.name}</td>
                                        <td className="custom-body-td">{coupon.discount_type}</td>
                                        <td className="custom-body-td">{coupon.discount_value}</td>
                                        <td className="custom-body-td">{coupon.minimum_order_amount}</td>
                                        <td className="custom-body-td">
                                            {coupon.times_used}
                                            {coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}
                                        </td>
                                        <td className="custom-body-td">
                                            {coupon.is_active ? "Active" : "Inactive"}
                                        </td>
                                        <td className="custom-body-td">
                                            <div className="flex gap-2">
                                                {permissions.includes("edit coupon") && (
                                                    <Link
                                                        href={route("coupons.edit", coupon.id)}
                                                        className="edit-button"
                                                    >
                                                        Edit
                                                    </Link>
                                                )}
                                                {permissions.includes("delete coupon") && (
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            if (confirm(`Delete coupon ${coupon.code}?`)) {
                                                                router.delete(route("coupons.destroy", coupon.id));
                                                            }
                                                        }}
                                                        className="delete-button"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr className="custom-body-tr">
                                    <td className="custom-body-td text-center" colSpan={8}>
                                        No coupons found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {coupons.links?.length > 3 && (
                    <div className="flex flex-wrap gap-2">
                        {coupons.links.map((link, index) => (
                            <button
                                key={index}
                                type="button"
                                disabled={!link.url}
                                onClick={() => link.url && router.visit(link.url)}
                                className={`rounded-md border px-3 py-2 text-sm ${
                                    link.active ? "bg-primary text-primary-foreground" : ""
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </section>
        </AuthenticatedLayout>
    );
};

export default CouponsIndex;
