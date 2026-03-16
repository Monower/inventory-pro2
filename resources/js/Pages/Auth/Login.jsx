import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import GuestLayout from "@/Layouts/GuestLayout";
import { useForm, usePage } from "@inertiajs/react";
import { sanitizePhoneInput } from "@/lib/phone";

export default function Login({ status }) {
    const { settings } = usePage().props;
    const phoneDigits = Number(settings?.phone_digits || 11);
    const { data, setData, post, processing, errors, reset } = useForm({
        phone: "",
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route("login"), {
            onFinish: () => reset("password"),
        });
    };

    return (
        <GuestLayout
            fullWidth
            hideBranding
            contentClassName="mt-4 overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 shadow-[0_30px_80px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70"
        >
            <div className="grid min-h-[700px] lg:grid-cols-[1.1fr_0.9fr]">
                <div className="relative hidden overflow-hidden bg-[linear-gradient(180deg,#f8fbff_0%,#edf5ff_100%)] lg:flex lg:flex-col lg:justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(250,204,21,0.16),transparent_28%)]" />
                    <div className="relative px-8 py-12 xl:px-12">
                        <div className="mx-auto max-w-2xl">
                            <img
                                src="/images/login_banner.png"
                                alt="Store staff using a modern point of sale and inventory system"
                                className="w-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.src = "/images/demo_image.jpg";
                                }}
                            />
                        </div>

                        <div className="mx-auto mt-6 max-w-xl text-center">
                            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-sky-600">
                                Retail Operations
                            </p>
                            <h1 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 xl:text-4xl">
                                Keep inventory in sync.
                            </h1>
                        </div>
                    </div>
                </div>

                <div className="relative flex items-center bg-white/75 px-6 py-10 dark:bg-slate-950/60 sm:px-10 lg:px-12 xl:px-16">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(21,128,61,0.08),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.09),transparent_32%)]" />

                    <div className="relative mx-auto w-full max-w-md">
                        <div className="mb-8">
                            <span className="inline-flex rounded-full border border-emerald-200/80 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                                Welcome Back
                            </span>
                            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                                Sign in to continue.
                            </h2>
                            <p className="mt-3 text-base leading-7 text-slate-600 dark:text-slate-300">
                                Use your phone number and password to login.
                            </p>
                        </div>

                        {status && (
                            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300">
                                {status}
                            </div>
                        )}

                        {errors.permission && (
                            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-300">
                                {errors.permission}
                            </div>
                        )}

                        <form onSubmit={submit} className="space-y-5">
                            <div className="relative">
                                <InputLabel htmlFor="phone" value="Phone" />

                                <input
                                    id="phone"
                                    type="text"
                                    name="phone"
                                    value={data.phone}
                                    className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 pr-16 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                    autoComplete={false}
                                    autoFocus
                                    inputMode="numeric"
                                    maxLength={phoneDigits}
                                    onChange={(e) =>
                                        setData(
                                            "phone",
                                            sanitizePhoneInput(e.target.value, phoneDigits),
                                        )
                                    }
                                />

                                <span className="pointer-events-none absolute right-4 top-[2.5rem] text-xs font-semibold text-slate-400 dark:text-slate-500">
                                    {data.phone.length}/{phoneDigits}
                                </span>

                                <InputError message={errors.phone} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="Password" />

                                <input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-2 block w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 shadow-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                    autoComplete="current-password"
                                    onChange={(e) => setData("password", e.target.value)}
                                />

                                <InputError message={errors.password} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <label className="inline-flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) =>
                                            setData("remember", e.target.checked)
                                        }
                                    />
                                    <span>Remember me</span>
                                </label>

                            </div>

                            <button
                                type="submit"
                                className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3.5 text-base font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-white disabled:cursor-not-allowed disabled:opacity-70 dark:bg-emerald-500 dark:text-slate-950 dark:hover:bg-emerald-400 dark:focus:ring-offset-slate-950"
                                disabled={processing}
                            >
                                {processing ? "Signing in..." : "Log in"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
