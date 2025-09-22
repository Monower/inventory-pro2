import ApplicationLogo from "@/Components/ApplicationLogo";
import { Link, usePage } from "@inertiajs/react";

export default function GuestLayout({ children }) {
    const { settings } = usePage().props;
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div className="flex justify-center mb-6">
                <img src={settings.logo_url} alt="Logo" className="w-32 h-20" />
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
                {settings.company_name}
            </h2>
            <p className="text-center text-gray-600 mb-2">
                Sign in to your account
            </p>
            {/* <div>
                <Link href="/">
                    <ApplicationLogo className="h-20 w-20 fill-current text-gray-500" />
                </Link>
            </div> */}

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
