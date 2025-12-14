import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { useForm, usePage, Head } from "@inertiajs/react";
import Modal from "@/Components/Modal/Modal";
import { useState } from "react";
import { dateFormater } from "@/util/DateFormater";
import NoDataFound from "@/Components/NoDataFound/NoDataFound";
import { EditIcon, Trash2Icon } from "lucide-react";

const Index = ({ categories }) => {
    const { company_name } = usePage().props;
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState(null); // null = create, object = edit
    const [clientErrors, setClientErrors] = useState({});

    console.log('categories: ',categories.length);

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

    const openCreateModal = () => {
        reset();
        setEditing(null);
        setClientErrors({});
        setOpen(true);
    };

    const openEditModal = (category) => {
        setData("name", category.name);
        setEditing(category);
        setClientErrors({});
        setOpen(true);
    };

    const validate = () => {
        const newErrors = {};
        if (!data.name || data.name.trim() === "") {
            newErrors.name = "Category name is required.";
        } else if (data.name.length < 3) {
            newErrors.name = "Category name must be at least 3 characters.";
        } else if (data.name.length > 255) {
            newErrors.name = "Category name cannot exceed 255 characters.";
        }
        setClientErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        if (editing) {
            put(route("categories.update", editing.id), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        } else {
            post(route("categories.store"), {
                onSuccess: () => {
                    reset();
                    setOpen(false);
                },
            });
        }
    };

    const handleDelete = (id) => {
        if (confirm("Are you sure you want to delete this category?")) {
            destroy(route("categories.destroy", id));
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title={`Categories - ${company_name}`} />
            <section>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="heading">Categories</h3>

                    <button
                        onClick={openCreateModal}
                        className="create-button"
                        disabled={processing}
                    >
                        Create new
                    </button>
                </div>

                {/* Modal for Create / Edit */}
                <Modal
                    open={open}
                    onOpenChange={setOpen}
                    title={editing ? "Edit Category" : "Create new Category"}
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
                                htmlFor="name"
                                className="block text-sm font-medium"
                            >
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                className={`w-full border rounded px-2 py-1 modal-input ${
                                    clientErrors.name || errors.name
                                        ? "border-red-500"
                                        : "border-gray-300"
                                }`}
                                disabled={processing}
                                placeholder="Enter category name"
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
                <div className="table-div">
                    {categories?.length > 0 ? (
                        <table className="w-full text-left border-collapse border">
                            <thead className="custom-thead">
                                <tr>
                                    <th className="custom-th rounded-l-md">
                                        SI
                                    </th>
                                    <th className="custom-th">Name</th>
                                    <th className="custom-th">Created At</th>
                                    <th className="custom-th rounded-r-md text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category, index) => (
                                    <tr
                                        key={category.id}
                                        className="custom-body-tr"
                                    >
                                        <td>{index + 1}</td>
                                        <td>{category.name}</td>
                                        <td>
                                            {dateFormater(category.created_at)}
                                        </td>
                                        <td className="text-center flex justify-center items-center gap-2">
                                            <button
                                                onClick={() =>
                                                    openEditModal(category)
                                                }
                                                className="edit-button"
                                                disabled={processing}
                                            >
                                                <EditIcon className="w-4 h-4 inline" />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleDelete(category.id)
                                                }
                                                className="delete-button"
                                                disabled={processing}
                                            >
                                                <Trash2Icon className="w-4 h-4 inline" />
                                                {/* {processing
                                                    ? "Deleting..."
                                                    : "Delete"} */}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <NoDataFound />
                    )}
                </div>
            </section>
        </AuthenticatedLayout>
    );
};

export default Index;
