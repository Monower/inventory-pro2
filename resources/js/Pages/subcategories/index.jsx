import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal/Modal";
import { useState } from "react";
import { dateFormater } from "@/util/DateFormater";

const Index = ({ subcategories, categories }) => {
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null); // null = create, object = edit
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

    const validate = () => {
        const newErrors = {};
        if (!data.category_id) {
            newErrors.category_id = "Category is required.";
        }
        if (!data.name || data.name.trim() === "") {
            newErrors.name = "Subcategory name is required.";
        } else if (data.name.length < 3) {
            newErrors.name = "Subcategory name must be at least 3 characters.";
        } else if (data.name.length > 255) {
            newErrors.name = "Subcategory name cannot exceed 255 characters.";
        }
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

    return (
        <AuthenticatedLayout>
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Subcategories</h3>

                    <button
                        onClick={openCreateModal}
                        className="bg-blue-500 text-white p-1 px-2 rounded"
                        disabled={processing}
                    >
                        Create new
                    </button>
                </div>

                {/* Modal for Create / Edit */}
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
                                onChange={(e) =>
                                    setData("category_id", e.target.value)
                                }
                                className={`w-full border rounded px-2 py-1 ${
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
                                    {clientErrors.category_id ||
                                        errors.category_id}
                                </div>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium"
                            >
                                Subcategory Name{" "}
                                <span className="text-red-500">*</span>
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

                {/* Table */}
                <div className="bg-white p-4 rounded shadow overflow-x-auto">
                    <table className="w-full text-left border-collapse border">
                        <thead className="border-b">
                            <tr className="[&>th]:border [&>th]:py-1 [&>th]:px-2">
                                <th>SI</th>
                                <th>Subcategory Name</th>
                                <th>Category</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {subcategories.map((subcategory, index) => (
                                <tr
                                    key={subcategory.id}
                                    className="[&>td]:border [&>td]:py-1 [&>td]:px-2"
                                >
                                    <td>{index + 1}</td>
                                    <td>{subcategory.name}</td>
                                    <td>{subcategory.category.name}</td>
                                    <td>
                                        {dateFormater(subcategory.created_at)}
                                    </td>
                                    <td>
                                        <button
                                            onClick={() =>
                                                openEditModal(subcategory)
                                            }
                                            className="bg-blue-500 text-white py-1 px-2 rounded mr-2"
                                            disabled={processing}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(subcategory.id)
                                            }
                                            className="bg-red-500 text-white py-1 px-2 rounded"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {subcategories.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="text-center text-gray-500 py-4"
                                    >
                                        No subcategories found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
