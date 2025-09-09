import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head } from "@inertiajs/react";
import DashboardCard from "../Components/DasboardCard/DashboardCard";
import { usePage } from "@inertiajs/react";
import { useState } from "react";
// import Modal from "@/Components/Modal";
import Modal from "@/Components/Modal/Modal";

export default function Dashboard({ data }) {
    // console.log('total product count: ',data);
    /* const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", username: "" });

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Submitting:", formData);
        setOpen(false); // close modal after submit
    }; */

    // const { auth } = usePage().props;

    // console.log('auth: ', auth);

    // console.log("modal: ", open);

    return (
        <AuthenticatedLayout
        /* header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            } */
        >
            <Head title="Dashboard" />

            {/* <div className="p-6">
                <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title="Edit Profile"
                    description="Update your profile information."
                    trigger={
                        <button onClick={() => setOpen(true)}>
                            Edit Profile
                        </button>
                    }
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </button>
                            <button type="button" onClick={handleSubmit}>
                                Save
                            </button>
                        </>
                    }
                >
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div>
                            <label htmlFor="name">Name</label>
                            <input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div>
                            <label htmlFor="username">Username</label>
                            <input
                                id="username"
                                value={formData.username}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        username: e.target.value,
                                    }))
                                }
                            />
                        </div>
                    </form>
                </Modal>
            </div> */}

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
