import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BackButton from "@/Components/BackButton/BackButton";
import { Head, Link, useForm, usePage } from "@inertiajs/react";

const Edit = ({ bank }) => {
    const { company_name } = usePage().props;
    const { data, setData, put, processing, errors } = useForm({
        name: bank?.name || "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("banks.update", bank.id));
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Update Bank - ${company_name}`} />
            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex items-center gap-4">
                        <BackButton url="banks.index" />
                        <div>
                            <h3 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Update bank
                            </h3>
                            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                Keep bank records accurate for payments and reporting.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 max-w-xl">
                            <fieldset className="custom-fieldset">
                                <legend className="text-sm mx-2">
                                    <label className="required-label">Bank name</label>
                                </legend>
                                <input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData("name", e.target.value)}
                                    className="custom-input"
                                    placeholder="Enter bank name"
                                />
                            </fieldset>
                            <small className="text-destructive">{errors.name}</small>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Link href={route("banks.index")} className="delete-button">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                className="create-button"
                                disabled={processing}
                            >
                                {processing ? "Updating..." : "Update"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Edit;
