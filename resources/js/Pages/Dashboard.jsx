import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DashboardCard from '../Components/DasboardCard/DashboardCard';

export default function Dashboard({data}) {
    console.log('total product count: ',data);
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
                {/* <h3>Dashboard.</h3> */}
                <div className='w-full flex flex-wrap items-center gap-3'>
                    {
                        data?.map((item, index) => {
                            return (
                                <DashboardCard key={index} heading={item?.heading} title={item?.title}
                                    icon={item?.icon} />
                            )
                        })
                    }
                </div>
            </section>
        </AuthenticatedLayout>
    );
}
