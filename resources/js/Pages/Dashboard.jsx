import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DashboardCard from '../Components/DasboardCard/DashboardCard';

export default function Dashboard() {
    return (
        <AuthenticatedLayout
            /* header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            } */
        >
            <Head title="Dashboard" />

            <section>
                <h3>Dashboard.</h3>
                <div className='w-full flex flex-wrap items-center gap-3 mt-4'>
                    {
                        [1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
                            <DashboardCard />
                        ))
                    }
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
