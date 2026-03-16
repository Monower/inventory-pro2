import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import { useForm } from "@inertiajs/react";
import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

const DEFAULT_LOGO = "/images/demo_image.jpg";
const DEFAULT_FAVICON = "/favicon.ico";

const Index = ({ settings }) => {
    const { data, setData, post, processing, errors } = useForm({
        company_name: settings?.company_name || "",
        logo: null,
        favicon: null,
        remove_logo: false,
        remove_favicon: false,
    });

    const [logoPreview, setLogoPreview] = useState(
        settings?.logo_url || DEFAULT_LOGO,
    );
    const [faviconPreview, setFaviconPreview] = useState(
        settings?.favicon_url || DEFAULT_FAVICON,
    );
    const logoInputRef = useRef(null);
    const faviconInputRef = useRef(null);

    const handleFileChange = (field, setPreview) => (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        setData(field, file);
        setData(`remove_${field}`, false);
        setPreview(URL.createObjectURL(file));
    };

    const resetFileInput = (inputRef) => {
        if (inputRef.current) {
            inputRef.current.value = "";
        }
    };

    const removeLogo = () => {
        setData("logo", null);
        setData("remove_logo", false);
        setLogoPreview(settings?.logo_url || DEFAULT_LOGO);
        resetFileInput(logoInputRef);
    };

    const removeFavicon = () => {
        setData("favicon", null);
        setData("remove_favicon", false);
        setFaviconPreview(settings?.favicon_url || DEFAULT_FAVICON);
        resetFileInput(faviconInputRef);
    };

    const discardLogo = () => {
        setData("logo", null);
        setData("remove_logo", true);
        setLogoPreview(DEFAULT_LOGO);
        resetFileInput(logoInputRef);
    };

    const discardFavicon = () => {
        setData("favicon", null);
        setData("remove_favicon", true);
        setFaviconPreview(DEFAULT_FAVICON);
        resetFileInput(faviconInputRef);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("company_name", data.company_name);

        if (data.logo) {
            formData.append("logo", data.logo);
        }

        if (data.favicon) {
            formData.append("favicon", data.favicon);
        }

        formData.append("remove_logo", data.remove_logo ? "1" : "0");
        formData.append("remove_favicon", data.remove_favicon ? "1" : "0");

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
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange("logo", setLogoPreview)}
                                    className="sr-only"
                                />
                                <InputError className="mt-2" message={errors.logo} />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="favicon"
                                    value="Favicon"
                                    hint="ICO, PNG, JPG, SVG, or WEBP up to 1 MB"
                                />
                                <div className="mt-2 flex items-center gap-3">
                                    <label
                                        htmlFor="favicon"
                                        className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-secondary px-4 py-2 text-sm text-secondary-foreground hover:opacity-90"
                                    >
                                        <Upload className="h-4 w-4" />
                                        Upload favicon
                                    </label>
                                    {data.favicon && (
                                        <button
                                            type="button"
                                            onClick={removeFavicon}
                                            className="inline-flex items-center gap-1 text-sm text-destructive"
                                        >
                                            <X className="h-4 w-4" />
                                            Remove selected
                                        </button>
                                    )}
                                </div>
                                <input
                                    id="favicon"
                                    ref={faviconInputRef}
                                    type="file"
                                    accept=".ico,image/png,image/jpeg,image/svg+xml,image/webp"
                                    onChange={handleFileChange("favicon", setFaviconPreview)}
                                    className="sr-only"
                                />
                                <InputError className="mt-2" message={errors.favicon} />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="relative rounded-lg border border-dashed border-border p-4">
                                <p className="mb-2 text-sm font-medium text-foreground">
                                    Logo Preview
                                </p>
                                {(settings?.logo_url || data.remove_logo) && !data.logo && (
                                    <button
                                        type="button"
                                        onClick={discardLogo}
                                        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition hover:bg-destructive/90"
                                        aria-label="Discard logo"
                                        title="Discard logo"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
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

                            <div className="relative rounded-lg border border-dashed border-border p-4">
                                <p className="mb-2 text-sm font-medium text-foreground">
                                    Favicon Preview
                                </p>
                                {(settings?.favicon_url || data.remove_favicon) && !data.favicon && (
                                    <button
                                        type="button"
                                        onClick={discardFavicon}
                                        className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-sm transition hover:bg-destructive/90"
                                        aria-label="Discard favicon"
                                        title="Discard favicon"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                                {faviconPreview ? (
                                    <div className="flex h-36 items-center justify-center rounded-md bg-muted">
                                        <img
                                            src={faviconPreview}
                                            alt="Favicon preview"
                                            className="h-16 w-16 rounded-md object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex h-36 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                                        No favicon selected
                                    </div>
                                )}
                            </div>
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
