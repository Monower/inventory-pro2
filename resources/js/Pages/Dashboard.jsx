import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DashboardCard from "../Components/DasboardCard/DashboardCard";
import { usePage } from "@inertiajs/react";
import { useState } from "react";
import Modal from "@/Components/Modal";

export default function Dashboard({ data }) {
    // console.log('total product count: ',data);
    const [open, setOpen] = useState(false);

    const { auth } = usePage().props;

    // console.log('auth: ', auth);

    console.log("modal: ", open);

    return (
        <AuthenticatedLayout
        /* header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            } */
        >
            <Head title="Dashboard" />

            <div className="p-6">
                <button onClick={() => setOpen(true)}>
                    Open Reusable Modal
                </button>

                <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title="Edit Profile"
                    description="Make changes to your profile here."
                    footer={
                        <>
                            <button
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </button>
                            <button onClick={() => setOpen(false)}>Save</button>
                        </>
                    }
                >
                    <input
                        type="text"
                        placeholder="Your name"
                        className="w-full rounded border px-3 py-2"
                    />
                </Modal>
            </div>

            <section>
                {/* <h3>Dashboard.</h3> */}
                <div className="w-full flex flex-wrap items-center gap-3">
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
