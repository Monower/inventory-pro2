import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DashboardCard from "../Components/DasboardCard/DashboardCard";

function TenantDashboard({ data }) {
    return (
        <section className="space-y-6 px-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                {data?.map((item, index) => (
                    <DashboardCard
                        key={index}
                        heading={item?.heading}
                        title={item?.title}
                        icon={item?.icon}
                    />
                ))}
            </div>
        </section>
    );
}

export default function Dashboard({ data }) {
    return (
        <AuthenticatedLayout title="Dashboard">
            <TenantDashboard data={data} />
        </AuthenticatedLayout>
    );
}
