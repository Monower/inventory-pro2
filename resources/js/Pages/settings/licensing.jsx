import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import { Link, useForm } from "@inertiajs/react";
import { Settings2, ShieldCheck } from "lucide-react";

const STATUS_TONE = {
    Active: "border-emerald-300 bg-emerald-50 text-emerald-900",
    Expired: "border-amber-300 bg-amber-50 text-amber-900",
    Invalid: "border-rose-300 bg-rose-50 text-rose-900",
    Suspended: "border-rose-300 bg-rose-50 text-rose-900",
    "Not Activated": "border-sky-300 bg-sky-50 text-sky-900",
};
const PLAN_CARD_TONE = {
    basic: "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/60",
    advance: "border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/45",
    premium: "border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 shadow-[0_10px_30px_rgba(245,158,11,0.16)] dark:border-amber-700 dark:bg-gradient-to-r dark:from-amber-950/70 dark:via-yellow-950/40 dark:to-orange-950/70 dark:shadow-[0_12px_32px_rgba(245,158,11,0.12)]",
};
const CURRENT_BADGE_TONE = {
    basic: "border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200",
    advance: "border-sky-300 bg-white text-sky-700 dark:border-sky-700 dark:bg-sky-950/70 dark:text-sky-200",
    premium: "border-amber-300 bg-white text-amber-700 dark:border-amber-700 dark:bg-amber-950/70 dark:text-amber-200",
};

const Licensing = ({ license, planCatalog = [] }) => {
    const activationForm = useForm({
        licensed_email: license?.licensed_email || "",
        license_key: "",
    });

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
        <AuthenticatedLayout title="Plans & Licensing">
            <section className="mx-auto w-full max-w-4xl space-y-6">
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div>
                            <h1 className="text-2xl font-semibold text-foreground">
                                Plans & Licensing
                            </h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Activate, validate, and manage the current plan for this installation.
                            </p>
                        </div>

                        {/* <Link
                            href={route("settings.index")}
                            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                        >
                            <Settings2 className="h-4 w-4" />
                            General Settings
                        </Link> */}
                    </div>
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
                                    <p className="mt-3 text-sm text-muted-foreground">
                                        {plan.key === "basic"
                                            ? "Core inventory and sales operations for getting started."
                                            : plan.key === "advance"
                                              ? "Includes everything in Basic, plus stronger team, finance, and reporting tools."
                                              : "Includes everything in Basic and Advance, plus the full multi-branch and advanced workflow suite."}
                                    </p>
                                </div>
                                {license?.plan === plan.key && license?.is_active ? (
                                    <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${CURRENT_BADGE_TONE[plan.key] || CURRENT_BADGE_TONE.basic}`}>
                                        Current
                                    </span>
                                ) : null}
                            </div>

                            {Array.isArray(plan.inherits_from) && plan.inherits_from.length ? (
                                <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 px-4 py-3 text-sm text-muted-foreground">
                                    Includes everything in{" "}
                                    <span className="font-semibold text-foreground">
                                        {plan.inherits_from
                                            .map((tier) => tier.charAt(0).toUpperCase() + tier.slice(1))
                                            .join(" + ")}
                                    </span>
                                </div>
                            ) : null}

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

                <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                    <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">
                                Dummy mode is active for now
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Until the real licensing server is ready, the app can validate
                                the configured dummy keys locally for testing.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Licensing;
