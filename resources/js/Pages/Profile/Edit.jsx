import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    const { company_name } = usePage().props;
    return (
        <AuthenticatedLayout title="Profile">
            <Head title={`Profile - ${company_name}`} />

            <div className="mx-auto max-w-7xl py-3">
                <div className="mb-6 rounded-xl border border-border bg-card p-6 shadow-sm">
                    <h1 className="text-2xl font-semibold text-foreground">My Profile</h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Keep your account details, password, and avatar up to date.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="w-full"
                        />
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <UpdatePasswordForm className="w-full" />
                    </div>

                    {/* <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                        <DeleteUserForm className="max-w-xl" />
                    </div> */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
