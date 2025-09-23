import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link, usePage } from "@inertiajs/react";

export default function GuestLayout({ children }) {
    const { settings } = usePage().props;
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            {settings?.logo_url && (
                <Link href="/" className="flex items-center gap-2">
                    <ApplicationLogo logo={settings.logo_url} />
                </Link>
            )}

            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                {settings.company_name?.length > 0
                    ? settings.company_name
                    : "Default Company Name"}
            </h2>

            <div className="mt-3 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
