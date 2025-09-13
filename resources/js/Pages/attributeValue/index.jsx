import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm } from "@inertiajs/react";
import Modal from "@/Components/Modal/Modal";
import { useState } from "react";

const Index = ({ values, attributes }) => {
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
        attribute_id: "",
        value: "",
    });

    const openCreateModal = () => {
        reset();
        setEditing(null);
        setClientErrors({});
        setOpen(true);
    };

    const openEditModal = (item) => {
        setData({
            attribute_id: item.attribute_id,
            value: item.value,
        });
        setEditing(item);
        setClientErrors({});
        setOpen(true);
    };

    const validate = () => {
        const newErrors = {};
        if (!data.attribute_id) {
            newErrors.attribute_id = "Please select an attribute.";
        }
        if (!data.value || data.value.trim() === "") {
            newErrors.value = "Value is required.";
        }
        setClientErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        if (editing) {
            put(route("attributeValues.update", editing.id), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        } else {
            post(route("attributeValues.store"), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this value?")) {
            destroy(route("attributeValues.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout>
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold">Attribute Values</h3>
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
                    title={editing ? "Edit Attribute Value" : "Create new Attribute Value"}
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
                                htmlFor="attribute_id"
                                className="block text-sm font-medium"
                            >
                                Attribute <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="attribute_id"
                                value={data.attribute_id}
                                onChange={(e) =>
                                    setData("attribute_id", e.target.value)
                                }
                                className={`w-full border rounded px-2 py-1 ${
                                    clientErrors.attribute_id || errors.attribute_id
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                disabled={processing}
                            >
                                <option value="">-- Select Attribute --</option>
                                {attributes.map((attr) => (
                                    <option key={attr.id} value={attr.id}>
                                        {attr.name}
                                    </option>
                                ))}
                            </select>
                            {(clientErrors.attribute_id || errors.attribute_id) && (
                                <div className="text-red-500 text-sm mt-1">
                                    {clientErrors.attribute_id || errors.attribute_id}
                                </div>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="value"
                                className="block text-sm font-medium"
                            >
                                Value <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="value"
                                value={data.value}
                                onChange={(e) =>
                                    setData("value", e.target.value)
                                }
                                className={`w-full border rounded px-2 py-1 ${
                                    clientErrors.value || errors.value
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                disabled={processing}
                            />
                            {(clientErrors.value || errors.value) && (
                                <div className="text-red-500 text-sm mt-1">
                                    {clientErrors.value || errors.value}
                                </div>
                            )}
                        </div>
                    </form>
                </Modal>

                <div className="bg-white p-4 rounded shadow">
                    <table className="w-full text-left border-collapse border">
                        <thead className="border-b">
                            <tr className="[&>th]:border [&>th]:py-1 [&>th]:px-2">
                                <th>SI</th>
                                <th>Attribute</th>
                                <th>Value</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {values.map((item, index) => (
                                <tr
                                    key={item.id}
                                    className="[&>td]:border [&>td]:py-1 [&>td]:px-2"
                                >
                                    <td>{index + 1}</td>
                                    <td>{item.attribute?.name}</td>
                                    <td>{item.value}</td>
                                    <td>
                                        <button
                                            onClick={() => openEditModal(item)}
                                            className="bg-blue-500 text-white py-1 px-2 rounded mr-2"
                                            disabled={processing}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
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

                            {values.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="text-center text-gray-500 py-4"
                                    >
                                        No attribute values found.
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
