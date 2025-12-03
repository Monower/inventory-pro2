import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal/Modal";
import DataTable from "@/Components/DataTable/DataTable";
import { useState } from "react";

const Index = ({ banks }) => {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [clientErrors, setClientErrors] = useState({});

    const {
        data,
        setData,
        post,
        put,
        processing,
        errors,
        reset,
        delete: destroy,
    } = useForm({
        name: "",
    });

    // ---- Modal Handlers ----
    const openCreateModal = () => {
        reset();
        setEditing(null);
        setClientErrors({});
        setOpen(true);
    };

    const openEditModal = (bank) => {
        setData("name", bank.name);
        setEditing(bank);
        setClientErrors({});
        setOpen(true);
    };

    // ---- Client Validation ----
    const validate = () => {
        const newErrors = {};
        if (!data.name.trim()) newErrors.name = "Bank name is required.";
        else if (data.name.length < 3)
            newErrors.name = "Bank name must be at least 3 characters.";
        else if (data.name.length > 255)
            newErrors.name = "Bank name cannot exceed 255 characters.";

        setClientErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        if (editing) {
            put(route("banks.update", editing.id), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        } else {
            post(route("banks.store"), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this bank?")) {
            destroy(route("banks.destroy", id));
        }
    };

    // ---- DataTable Setup ----
    const columns = [
        { key: "si", label: "SI" },
        { key: "name", label: "Bank Name" },
    ];

    const tableData = banks.map((bank, index) => ({
        ...bank,
        si: index + 1,
    }));

    return (
        <AuthenticatedLayout>
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Banks</h3>

                    <button
                        onClick={openCreateModal}
                        className="bg-blue-500 text-white p-1 px-2 rounded"
                        disabled={processing}
                    >
                        Create new
                    </button>
                </div>

                {/* ---- Modal (Create / Edit) ---- */}
                <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title={editing ? "Edit Bank" : "Create new Bank"}
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="px-3 py-1 rounded bg-gray-300"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={processing}
                                className={`px-3 py-1 rounded text-white ${
                                    processing
                                        ? "bg-blue-300 cursor-not-allowed"
                                        : "bg-blue-500 hover:bg-blue-600"
                                }`}
                            >
                                {processing
                                    ? editing
                                        ? "Updating..."
                                        : "Saving..."
                                    : editing
                                    ? "Update"
                                    : "Save"}
                            </button>
                        </>
                    }
                >
                    <form onSubmit={handleSubmit} className="grid gap-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium"
                            >
                                Bank Name <span className="text-red-500">*</span>
                            </label>

                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                className={`w-full border rounded px-2 py-1 ${
                                    clientErrors.name || errors.name
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                disabled={processing}
                            />

                            {(clientErrors.name || errors.name) && (
                                <div className="text-red-500 text-sm mt-1">
                                    {clientErrors.name || errors.name}
                                </div>
                            )}
                        </div>
                    </form>
                </Modal>

                {/* ---- Reusable Data Table ---- */}
                <DataTable
                    columns={columns}
                    data={tableData}
                    actions={(row) => (
                        <div className="flex gap-2">
                            <button
                                onClick={() => openEditModal(row)}
                                className="bg-blue-500 text-white py-1 px-2 rounded"
                                disabled={processing}
                            >
                                Edit
                            </button>

                            <button
                                onClick={() => handleDelete(row.id)}
                                className="bg-red-500 text-white py-1 px-2 rounded"
                                disabled={processing}
                            >
                                {processing ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    )}
                />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
