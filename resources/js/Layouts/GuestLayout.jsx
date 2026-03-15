import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link, usePage, Head } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, resolveTheme } from "@/lib/theme";

export default function GuestLayout({
    children,
    fullWidth = false,
    contentClassName = "",
    hideBranding = false,
}) {
    const { settings } = usePage().props;
    const [theme, setTheme] = useState(() => resolveTheme());

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <div
            className={`relative flex min-h-screen flex-col bg-background ${
                fullWidth
                    ? "justify-center overflow-hidden px-4 py-8 sm:px-6 lg:px-10"
                    : "items-center pt-6 sm:justify-center sm:pt-0"
            }`}
        >
            <Head title={"Login"} />
            <button
                type="button"
                onClick={toggleTheme}
                className="fixed right-4 top-4 rounded-lg border border-border bg-card p-2 text-foreground hover:bg-muted transition-colors"
                title="Toggle Theme"
            >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {fullWidth ? (
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(21,128,61,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(249,115,22,0.12),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(245,247,250,0.98))] dark:bg-[radial-gradient(circle_at_top_left,_rgba(74,222,128,0.14),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(251,146,60,0.12),_transparent_28%),linear-gradient(180deg,_rgba(8,15,19,0.98),_rgba(15,23,42,0.98))]" />
            ) : null}

            <div
                className={
                    fullWidth
                        ? "mx-auto flex w-full max-w-7xl flex-col"
                        : "flex flex-col items-center"
                }
            >
                {!hideBranding && settings?.logo_url && (
                    <Link href="/" className="flex items-center gap-2">
                        <ApplicationLogo logo={settings.logo_url} />
                    </Link>
                )}

                {!hideBranding ? (
                    <h2 className="heading text-primary mb-2">
                        {settings.company_name?.length > 0
                            ? settings.company_name
                            : "Default company name."}
                    </h2>
                ) : null}

                <div
                    className={
                        fullWidth
                            ? contentClassName
                            : `mt-3 w-full overflow-hidden bg-background px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg border border-ring ${contentClassName}`
                    }
                >
                    {children}
                </div>
            </div>
        </div>
    );
}
