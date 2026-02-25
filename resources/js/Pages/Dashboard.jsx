import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DashboardCard from "../Components/DasboardCard/DashboardCard";

export default function Dashboard({ data }) {
    return (
        <AuthenticatedLayout
        title="Dashboard"
        /* header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            } */
        >
            <section className="px-4">
                <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {data?.map((item, index) => {
                        return (
                            <DashboardCard
                                key={index}
                                heading={item?.heading}
                                title={item?.title}
                                icon={item?.icon}
                            />
                        );
                    })}
                </div>
            </section>
        </AuthenticatedLayout>
    );
}