import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal/Modal";
import DataTable from "@/Components/DataTable/DataTable";
import { useState } from "react";
import { dateFormater } from "@/util/DateFormater";
import { EditIcon, Trash2Icon } from "lucide-react";

const Index = ({ subcategories, categories }) => {
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
        category_id: "",
    });

    // ---- Modal handlers ----
    const openCreateModal = () => {
        reset();
        setEditing(null);
        setClientErrors({});
        setOpen(true);
    };

    const openEditModal = (subcategory) => {
        setData({
            name: subcategory.name,
            category_id: subcategory.category_id,
        });
        setEditing(subcategory);
        setClientErrors({});
        setOpen(true);
    };

    // ---- Validation ----
    const validate = () => {
        const newErrors = {};
        if (!data.category_id) newErrors.category_id = "Category is required.";
        if (!data.name?.trim()) newErrors.name = "Subcategory name is required.";
        else if (data.name.length < 3)
            newErrors.name = "Subcategory name must be at least 3 characters.";
        else if (data.name.length > 255)
            newErrors.name = "Subcategory name cannot exceed 255 characters.";

        setClientErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        if (editing) {
            put(route("subcategories.update", editing.id), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        } else {
            post(route("subcategories.store"), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this subcategory?")) {
            destroy(route("subcategories.destroy", id));
        }
    };

    // ---- DataTable setup ----
    const columns = [
        { key: "si", label: "SI" },
        { key: "name", label: "Subcategory Name" },
        { key: "category_name", label: "Category" },
        { key: "created_at", label: "Created At" },
    ];

    const tableData = subcategories.map((sub, index) => ({
        ...sub,
        si: index + 1,
        category_name: sub.category?.name || "-",
        created_at: dateFormater(sub.created_at),
    }));

    return (
        <AuthenticatedLayout>
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="heading">Subcategories</h3>
                    <button
                        onClick={openCreateModal}
                        className="create-button"
                        disabled={processing}
                    >
                        Create new
                    </button>
                </div>

                {/* ---- Modal (Create / Edit) ---- */}
                <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title={editing ? "Edit Subcategory" : "Create new Subcategory"}
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
                                htmlFor="category_id"
                                className="block text-sm font-medium"
                            >
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="category_id"
                                value={data.category_id}
                                onChange={(e) => setData("category_id", e.target.value)}
                                className={`w-full border rounded px-2 py-1 modal-input ${
                                    clientErrors.category_id || errors.category_id
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                disabled={processing}
                            >
                                <option value="">Select Category</option>
                                {categories?.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                            {(clientErrors.category_id || errors.category_id) && (
                                <div className="text-red-500 text-sm mt-1">
                                    {clientErrors.category_id || errors.category_id}
                                </div>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium"
                            >
                                Subcategory Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData("name", e.target.value)}
                                className={`w-full border rounded px-2 py-1 modal-input ${
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

                {/* ---- Reusable DataTable ---- */}
                <DataTable
                    columns={columns}
                    data={tableData}
                    actions={(row) => (
                        <div className="flex gap-2">
                            <button
                                onClick={() => openEditModal(row)}
                                className="edit button"
                                disabled={processing}
                            >
                                <EditIcon className="w-4 h-4 inline" />
                            </button>
                            <button
                                onClick={() => handleDelete(row.id)}
                                className="delete-button"
                                disabled={processing}
                            >
                                <Trash2Icon className="w-4 h-4 inline" />
                                {/* {processing ? "Deleting..." : "Delete"} */}
                            </button>
                        </div>
                    )}
                />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
