import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import { useForm } from "@inertiajs/react";
import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

const Index = ({ settings }) => {
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
            <section className="mx-auto w-full max-w-4xl space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-foreground">General Settings</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Configure your workspace branding shown across dashboard, login,
                        and documents.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-border bg-card p-6 shadow-sm"
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
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:opacity-90"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload logo
                                    </label>
                                    {data.logo && (
                                        <button
                                            type="button"
                                            onClick={removeLogo}
                                            className="inline-flex items-center gap-1 text-sm text-destructive"
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

                        <div className="rounded-lg border border-dashed border-border p-4">
                            <p className="mb-2 text-sm font-medium text-foreground">Logo Preview</p>
                            {logoPreview ? (
                                <img
                                    src={logoPreview}
                                    alt="Company logo preview"
                                    className="h-36 w-full rounded-md object-contain"
                                />
                            ) : (
                                <div className="flex h-36 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
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
