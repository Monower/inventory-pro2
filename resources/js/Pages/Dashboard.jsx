import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import OrderChartCard from "../Components/Dashboard/OrderChartCard";
import SalesChartCard from "../Components/Dashboard/SalesChartCard";
import DashboardCard from "../Components/DasboardCard/DashboardCard";

function TenantDashboard({ data, salesChart, orderChart, filters }) {
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

            <SalesChartCard salesChart={salesChart} filters={filters} />
            <OrderChartCard orderChart={orderChart} filters={filters} />
        </section>
    );
}

export default function Dashboard({ data, salesChart, orderChart, filters }) {
    return (
        <AuthenticatedLayout title="Dashboard">
            <TenantDashboard
                data={data}
                salesChart={salesChart}
                orderChart={orderChart}
                filters={filters}
            />
        </AuthenticatedLayout>
    );
}
