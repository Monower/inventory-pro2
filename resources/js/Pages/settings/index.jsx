import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import { useForm, usePage, Head } from "@inertiajs/react";
import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

const Index = ({ settings }) => {
    const { company_name } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        company_name: settings?.company_name || "",
        logo: null,
    });

    const [logoPreview, setLogoPreview] = useState(settings?.logo_url || null);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        setData("logo", file);
        setLogoPreview(URL.createObjectURL(file));
    };

    const removeLogo = () => {
        setData("logo", null);
        setLogoPreview(settings?.logo_url || null);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("company_name", data.company_name);

        if (data.logo) {
            formData.append("logo", data.logo);
        }

        post(route("settings.update"), formData, { forceFormData: true });
    };

    return (
        <AuthenticatedLayout title="Settings">
            <Head title={`Settings - ${company_name}`} />

            <section className="space-y-6">
                <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-amber-50 via-white to-sky-50 p-6 shadow-sm dark:border-slate-700 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700 dark:text-amber-300">
                                Settings Module
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
                                Configure workspace branding
                            </h1>
                            <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                Update the company name and logo used across the
                                dashboard, login screens, and printed documents.
                            </p>
                        </div>
                        <div className="rounded-2xl border border-white/70 bg-white/80 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Current brand
                            </p>
                            <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                                {data.company_name || "Not set"}
                            </p>
                        </div>
                    </div>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                    <div className="grid gap-6 md:grid-cols-[1fr_220px]">
                        <div className="space-y-4">
                            <div>
                                <InputLabel
                                    htmlFor="company_name"
                                    value="Company Name"
                                    required
                                />
                                <input
                                    id="company_name"
                                    type="text"
                                    value={data.company_name}
                                    onChange={(e) =>
                                        setData("company_name", e.target.value)
                                    }
                                    className="mt-1"
                                    placeholder="Enter company name"
                                    required
                                />
                                <InputError className="mt-2" message={errors.company_name} />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="logo"
                                    value="Company Logo"
                                    hint="PNG/JPG up to 2 MB"
                                />
                                <div className="mt-2 flex items-center gap-3">
                                    <label
                                        htmlFor="logo"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload logo
                                    </label>
                                    {data.logo && (
                                        <button
                                            type="button"
                                            onClick={removeLogo}
                                            className="inline-flex items-center gap-1 text-sm text-red-600 dark:text-red-400"
                                        >
                                            <X className="h-4 w-4" />
                                            Remove selected
                                        </button>
                                    )}
                                </div>
                                <input
                                    id="logo"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="sr-only"
                                />
                                <InputError className="mt-2" message={errors.logo} />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-600">
                            <p className="mb-2 text-sm font-medium text-slate-900 dark:text-slate-100">Logo Preview</p>
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Company logo preview"
                                    className="h-36 w-full rounded-xl object-contain"
                                />
                            ) : (
                                <div className="flex h-36 items-center justify-center rounded-xl bg-slate-100 text-sm text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                    No logo selected
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={processing}
                            className="create-button px-5 py-2"
                        >
                            {processing ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
