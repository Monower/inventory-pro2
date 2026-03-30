import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Head, useForm, usePage } from "@inertiajs/react";

export default function Create() {
    const { company_name } = usePage().props;
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        description: "",
        monthly_price: "",
        yearly_price: "",
        trial_days: 14,
        is_active: true,
        sort_order: 0,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("super-admin.plans.store"));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Create Plan - ${company_name}`} />
            <section className="space-y-6">
                <div className="flex items-center gap-4">
                    <BackButton url="super-admin.plans.index" />
                    <div>
                        <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Create billing plan</h1>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Define monthly and yearly prices, trial duration, and display order.</p>
                    </div>
                </div>

                <form onSubmit={submit} className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium">Plan name</label>
                            <input className="mt-1" value={data.name} onChange={(e) => setData("name", e.target.value)} />
                            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium">Trial days</label>
                            <input type="number" className="mt-1" value={data.trial_days} onChange={(e) => setData("trial_days", e.target.value)} />
                            {errors.trial_days && <p className="mt-2 text-sm text-red-600">{errors.trial_days}</p>}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium">Monthly price</label>
                            <input type="number" step="0.01" className="mt-1" value={data.monthly_price} onChange={(e) => setData("monthly_price", e.target.value)} />
                            {errors.monthly_price && <p className="mt-2 text-sm text-red-600">{errors.monthly_price}</p>}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium">Yearly price</label>
                            <input type="number" step="0.01" className="mt-1" value={data.yearly_price} onChange={(e) => setData("yearly_price", e.target.value)} />
                            {errors.yearly_price && <p className="mt-2 text-sm text-red-600">{errors.yearly_price}</p>}
                        </div>
                        <div>
                            <label className="mb-2 block text-sm font-medium">Sort order</label>
                            <input type="number" className="mt-1" value={data.sort_order} onChange={(e) => setData("sort_order", e.target.value)} />
                        </div>
                        <div className="flex items-center gap-3 pt-8">
                            <input id="is_active" type="checkbox" checked={data.is_active} onChange={(e) => setData("is_active", e.target.checked)} />
                            <label htmlFor="is_active" className="text-sm font-medium">Plan is active</label>
                        </div>
                    </div>
                    <div>
                        <label className="mb-2 block text-sm font-medium">Description</label>
                        <textarea className="mt-1 min-h-28 w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3" value={data.description} onChange={(e) => setData("description", e.target.value)} />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" disabled={processing} className="create-button px-5 py-2">
                            {processing ? "Saving..." : "Create plan"}
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
}
