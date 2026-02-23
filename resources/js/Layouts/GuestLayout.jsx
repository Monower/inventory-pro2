import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { applyTheme, resolveTheme } from "@/lib/theme";

export default function GuestLayout({ children }) {
    const { settings } = usePage().props;
    const [theme, setTheme] = useState(() => resolveTheme());

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
    };

    return (
        <div className="flex min-h-screen flex-col items-center bg-background pt-6 sm:justify-center sm:pt-0">
            <button
                type="button"
                onClick={toggleTheme}
                className="fixed right-4 top-4 rounded-lg border border-border bg-card p-2 text-foreground hover:bg-muted transition-colors"
                title="Toggle Theme"
            >
                {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {settings?.logo_url && (
                <Link href="/" className="flex items-center gap-2">
                    <ApplicationLogo logo={settings.logo_url} />
                </Link>
            )}

            <h2 className="heading text-primary mb-2">
                {settings.company_name?.length > 0
                    ? settings.company_name
                    : "Default company name."}
            </h2>

            <div className="mt-3 w-full overflow-hidden bg-background px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg border border-ring">
                {children}
            </div>
        </div>
    );
}
