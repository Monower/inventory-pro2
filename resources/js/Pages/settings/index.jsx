import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputLabel from "@/Components/InputLabel";
import InputError from "@/Components/InputError";
import { useForm } from "@inertiajs/react";
import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

const DEFAULT_LOGO = "/images/demo_image.jpg";
const DEFAULT_FAVICON = "/favicon.ico";
const STATUS_TONE = {
    Active: "border-emerald-300 bg-emerald-50 text-emerald-900",
    Expired: "border-amber-300 bg-amber-50 text-amber-900",
    Invalid: "border-rose-300 bg-rose-50 text-rose-900",
    Suspended: "border-rose-300 bg-rose-50 text-rose-900",
    "Not Activated": "border-sky-300 bg-sky-50 text-sky-900",
};
const PLAN_CARD_TONE = {
    basic: "border-slate-300 bg-slate-50",
    advance: "border-sky-300 bg-sky-50",
    premium: "border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 shadow-[0_10px_30px_rgba(245,158,11,0.16)]",
};

const Index = ({ settings, license, planCatalog = [] }) => {
    const { data, setData, post, processing, errors } = useForm({
        company_name: settings?.company_name || "",
        phone_digits: settings?.phone_digits || 11,
        currency_symbol: settings?.currency_symbol || "TK",
        currency_code: settings?.currency_code || "BDT",
        product_units: settings?.product_units || "pcs\nkg\nliter",
        logo: null,
        favicon: null,
        remove_logo: false,
        remove_favicon: false,
    });
    const activationForm = useForm({
        licensed_email: license?.licensed_email || "",
        license_key: "",
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
        formData.append("phone_digits", data.phone_digits);
        formData.append("currency_symbol", data.currency_symbol);
        formData.append("currency_code", data.currency_code);
        formData.append("product_units", data.product_units);

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

    const activateLicense = (e) => {
        e.preventDefault();
        activationForm.post(route("settings.license.activate"));
    };

    const refreshLicense = () => {
        activationForm.post(route("settings.license.refresh"), {
            preserveScroll: true,
        });
    };

    const removeLicense = () => {
        activationForm.delete(route("settings.license.destroy"), {
            preserveScroll: true,
        });
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

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                        <div className="space-y-3">
                            <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${STATUS_TONE[license?.status_label] || STATUS_TONE["Not Activated"]}`}>
                                {license?.status_label || "Not Activated"}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-foreground">
                                    Plan Activation & License
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Customers in Bangladesh pay via bKash, receive a license key
                                    by email, and activate that key here.
                                </p>
                            </div>
                            <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                                <p><span className="font-medium text-foreground">Current plan:</span> {license?.plan_label || "No plan yet"}</p>
                                <p><span className="font-medium text-foreground">Masked key:</span> {license?.license_key_masked || "Not activated"}</p>
                                <p><span className="font-medium text-foreground">Licensed email:</span> {license?.licensed_email || "Not set"}</p>
                                <p><span className="font-medium text-foreground">Last validation:</span> {license?.last_validated_at || "Never"}</p>
                            </div>
                            {license?.last_validation_error ? (
                                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
                                    {license.last_validation_error}
                                </div>
                            ) : null}
                        </div>

                        <form
                            onSubmit={activateLicense}
                            className="w-full max-w-xl space-y-4 rounded-xl border border-border bg-background p-5"
                        >
                            <div>
                                <InputLabel
                                    htmlFor="licensed_email"
                                    value="Buyer Email"
                                    hint="Use the same email address that received the key."
                                />
                                <input
                                    id="licensed_email"
                                    type="email"
                                    value={activationForm.data.licensed_email}
                                    onChange={(e) => activationForm.setData("licensed_email", e.target.value)}
                                    className="mt-1"
                                    placeholder="buyer@example.com"
                                />
                                <InputError className="mt-2" message={activationForm.errors.licensed_email} />
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="license_key"
                                    value="License Key"
                                    hint="Paste the Basic, Advance, or Premium key sent after payment."
                                    required
                                />
                                <input
                                    id="license_key"
                                    type="text"
                                    value={activationForm.data.license_key}
                                    onChange={(e) => activationForm.setData("license_key", e.target.value)}
                                    className="mt-1"
                                    placeholder="IP2-BD-XXXX-XXXX-XXXX"
                                    required
                                />
                                <InputError className="mt-2" message={activationForm.errors.license_key} />
                            </div>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="submit"
                                    className="create-button px-5 py-2"
                                    disabled={activationForm.processing}
                                >
                                    {activationForm.processing ? "Activating..." : "Activate Plan"}
                                </button>
                                <button
                                    type="button"
                                    onClick={refreshLicense}
                                    className="rounded-md border border-border px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-muted"
                                    disabled={activationForm.processing || license?.requires_activation}
                                >
                                    Refresh Validation
                                </button>
                                <button
                                    type="button"
                                    onClick={removeLicense}
                                    className="rounded-md border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
                                    disabled={activationForm.processing || license?.requires_activation}
                                >
                                    Remove License
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-3">
                    {planCatalog.map((plan) => (
                        <div
                            key={plan.key}
                            className={`rounded-xl border p-5 shadow-sm ${
                                license?.plan === plan.key && license?.is_active
                                    ? PLAN_CARD_TONE[plan.key] || "border-emerald-300 bg-emerald-50"
                                    : "border-border bg-card"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                        {plan.label}
                                    </p>
                                    <h3 className="mt-2 text-2xl font-semibold text-foreground">
                                        {plan.price_label}
                                    </h3>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        Payment via {plan.payment_method}
                                    </p>
                                </div>
                                {license?.plan === plan.key && license?.is_active ? (
                                    <span className="rounded-full border border-emerald-300 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
                                        Current
                                    </span>
                                ) : null}
                            </div>

                            <div className="mt-4 space-y-2">
                                {(plan.highlights || plan.included_features).map((feature) => (
                                    <div
                                        key={feature.key}
                                        className="rounded-lg border border-border/70 bg-background/80 px-3 py-2 text-sm text-foreground"
                                    >
                                        {feature.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
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
                                    htmlFor="phone_digits"
                                    value="Phone Digits"
                                    hint="This controls login, employee, and customer phone input length."
                                    required
                                />
                                <input
                                    id="phone_digits"
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={data.phone_digits}
                                    onChange={(e) =>
                                        setData("phone_digits", e.target.value)
                                    }
                                    className="mt-1"
                                    placeholder="Enter allowed phone digits"
                                    required
                                />
                                <InputError className="mt-2" message={errors.phone_digits} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <InputLabel
                                        htmlFor="currency_symbol"
                                        value="Currency Symbol"
                                        hint="Examples: TK, $, EUR"
                                        required
                                    />
                                    <input
                                        id="currency_symbol"
                                        type="text"
                                        value={data.currency_symbol}
                                        onChange={(e) =>
                                            setData("currency_symbol", e.target.value)
                                        }
                                        className="mt-1"
                                        placeholder="Enter currency symbol"
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.currency_symbol} />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="currency_code"
                                        value="Currency Code"
                                        hint="Examples: BDT, USD, EUR"
                                        required
                                    />
                                    <input
                                        id="currency_code"
                                        type="text"
                                        value={data.currency_code}
                                        onChange={(e) =>
                                            setData("currency_code", e.target.value.toUpperCase())
                                        }
                                        className="mt-1"
                                        placeholder="Enter currency code"
                                        required
                                    />
                                    <InputError className="mt-2" message={errors.currency_code} />
                                </div>
                            </div>

                            <div>
                                <InputLabel
                                    htmlFor="product_units"
                                    value="Product Units"
                                    hint="Add one unit per line. Example: pcs, kg, liter."
                                    required
                                />
                                <textarea
                                    id="product_units"
                                    value={data.product_units}
                                    onChange={(e) =>
                                        setData("product_units", e.target.value)
                                    }
                                    className="mt-1 min-h-32"
                                    placeholder={"pcs\nkg\nliter"}
                                    required
                                />
                                <InputError className="mt-2" message={errors.product_units} />
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
