import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage } from "@inertiajs/react";
import Modal from "@/Components/Modal/Modal";
import { useState } from "react";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, Trash2Icon } from "lucide-react";
import IndexFilters from "@/Components/IndexFilters";
import Pagination from "@/Components/Pagination";

const Index = ({ values, attributes }) => {
    const { company_name, filters } = usePage().props;
    const list = values?.data ?? [];
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
            value: item.name,
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
            <Head title={`Attribute values - ${company_name}`} />
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="heading">Attribute Values</h3>
                    <button
                        onClick={openCreateModal}
                        className="create-button"
                        disabled={processing}
                    >
                        Create Attribute Value
                    </button>
                </div>
                <IndexFilters
                    routeName="attributeValues.index"
                    initialQuery={filters?.q || ""}
                    placeholder="Search attribute values..."
                    className="mb-4"
                />

                {/* Modal for Create / Edit */}
                <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title={editing ? "Edit Attribute Value" : "Create Attribute Value"}
                    footer={
                        <>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="delete-button"
                                disabled={processing}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={processing}
                                className={`create-button ${
                                    processing
                                        ? "cursor-not-allowed"
                                        : "hover:bg-blue-600"
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
                                className={`modal-input w-full ${
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
                                className={`modal-input w-full ${
                                    clientErrors.value || errors.value
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                disabled={processing}
                                placeholder="Enter attribute value"
                            />
                            {(clientErrors.value || errors.value) && (
                                <div className="text-red-500 text-sm mt-1">
                                    {clientErrors.value || errors.value}
                                </div>
                            )}
                        </div>
                    </form>
                </Modal>

                <div className="table-div">
                    {list.length === 0 ? (
                        <NoDataFound />
                    ) : (
                        <table className="custom-table">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">SI</th>
                                    <th className="custom-th">Attribute</th>
                                    <th className="custom-th">Value</th>
                                    <th className="custom-th rounded-r-md">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {list.map((item, index) => (
                                    <tr
                                        key={item.id}
                                        className="custom-body-tr"
                                    >
                                        <td className="custom-body-td">
                                            {(values.current_page - 1) * values.per_page + index + 1}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.attribute?.name}
                                        </td>
                                        <td className="custom-body-td">
                                            {item.name}
                                        </td>
                                        <td className="custom-body-td text-center flex justify-center items-center gap-2">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="edit-button"
                                                disabled={processing}
                                            >
                                                <EditIcon className="w-4 h-4 inline" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="delete-button"
                                                disabled={processing}
                                            >
                                                <Trash2Icon className="w-4 h-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <Pagination links={values?.links} />
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
